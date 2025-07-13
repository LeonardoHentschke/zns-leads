# Use uma imagem base oficial do Node.js com Alpine para menor tamanho
FROM node:20-alpine AS base

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema necessárias para o Prisma e outras bibliotecas nativas
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    postgresql-client

# ===============================
# Estágio de dependências
# ===============================
FROM base AS deps

# Copiar arquivos de configuração de dependências
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# ===============================
# Estágio de build
# ===============================
FROM base AS builder

# Copiar arquivos de configuração
COPY package.json package-lock.json* ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Instalar todas as dependências (incluindo devDependencies)
RUN npm ci

# Copiar código fonte
COPY src ./src/

# Gerar o Prisma Client
RUN npx prisma generate

# Build da aplicação
RUN npm run build

# ===============================
# Estágio de produção
# ===============================
FROM base AS production

# Criar usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodeuser

# Copiar dependências de produção
COPY --from=deps --chown=nodeuser:nodejs /app/node_modules ./node_modules

# Copiar arquivos do Prisma
COPY --from=builder --chown=nodeuser:nodejs /app/prisma ./prisma/

# Copiar aplicação buildada
COPY --from=builder --chown=nodeuser:nodejs /app/build ./build/

# Copiar package.json para ter acesso aos scripts
COPY --chown=nodeuser:nodejs package.json ./

# Garantir permissões corretas antes de gerar o Prisma Client
RUN chown -R nodeuser:nodejs /app/node_modules
RUN chmod -R 755 /app/node_modules

# Gerar o Prisma Client para produção
RUN npx prisma generate

# Mudar para usuário não-root
USER nodeuser

# Expor a porta que a aplicação usa
EXPOSE 3333

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3333

# Script de inicialização que executa migrations e inicia a aplicação
RUN echo '#!/bin/sh\n\
set -e\n\
\n\
echo "🔄 Aguardando PostgreSQL ficar disponível..."\n\
until pg_isready -h postgres -p 5432 -U $POSTGRES_USER 2>/dev/null; do\n\
  echo "Aguardando database..."\n\
  sleep 2\n\
done\n\
\n\
echo "🔄 Verificando se as migrações são necessárias..."\n\
if npx prisma migrate status | grep -q "Database schema is not up to date"; then\n\
  echo "🔄 Executando migrations do Prisma..."\n\
  npx prisma migrate deploy\n\
else\n\
  echo "✅ Database já está atualizado com as migrações"\n\
fi\n\
\n\
echo "🔄 Sincronizando schema do Prisma..."\n\
npx prisma db push --accept-data-loss || echo "Schema já está sincronizado"\n\
\n\
echo "🚀 Iniciando aplicação..."\n\
exec npm start' > /app/start.sh

# Tornar o script executável e ajustar permissões
RUN chmod +x /app/start.sh && chown nodeuser:nodejs /app/start.sh

# Comando de inicialização
CMD ["/app/start.sh"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT}/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"
