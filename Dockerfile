# Use uma imagem base oficial do Node.js com Alpine para menor tamanho
FROM node:20-alpine AS base

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema necessárias para o Prisma e outras bibliotecas nativas
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    postgresql-client \
    bind-tools \
    netcat-openbsd

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

# Gerar o Prisma Client para produção como root para evitar problemas de permissão
RUN npx prisma generate

# Ajustar permissões do Prisma Client gerado
RUN chown -R nodeuser:nodejs /app/node_modules/.prisma
RUN chmod -R 755 /app/node_modules/.prisma

# Copiar e configurar script de inicialização
COPY --chown=nodeuser:nodejs start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Mudar para usuário não-root
USER nodeuser

# Expor a porta que a aplicação usa
EXPOSE 3333

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3333

# Comando de inicialização
CMD ["/app/start.sh"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT}/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"
