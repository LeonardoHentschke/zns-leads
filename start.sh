#!/bin/sh
set -e

echo "🔧 Informações de debug:"
echo "POSTGRES_USER: $POSTGRES_USER"
echo "DATABASE_URL: $DATABASE_URL"
echo "Tentando conectar em: srv-captain--zns-leads-postgres:5432"

echo "🔄 Aguardando PostgreSQL ficar disponível..."
echo "Testando conectividade de rede..."

# Teste de conectividade básica
echo "🔍 Testando possíveis hosts PostgreSQL..."

# Lista de possíveis hosts para testar
POSTGRES_HOSTS="srv-captain--zns-leads-postgres srv-captain--postgres srv-captain--zns-postgres"

POSTGRES_HOST=""
for host in $POSTGRES_HOSTS; do
  echo "🔍 Testando host: $host"
  if nc -z $host 5432 2>/dev/null; then
    echo "✅ Host encontrado: $host"
    POSTGRES_HOST=$host
    break
  else
    echo "❌ Host não acessível: $host"
  fi
done

if [ -z "$POSTGRES_HOST" ]; then
  echo "❌ Nenhum host PostgreSQL encontrado!"
  echo "💡 Verifique se você criou o app PostgreSQL no CapRover"
  echo "💡 Nomes testados: $POSTGRES_HOSTS"
  exit 1
fi

echo "🔍 Tentando com pg_isready no host: $POSTGRES_HOST..."
until pg_isready -h $POSTGRES_HOST -p 5432 -U $POSTGRES_USER 2>/dev/null; do
  echo "⏳ Aguardando database... ($(date))"
  echo "🔄 Testando novamente em 5 segundos..."
  sleep 5
done

echo "✅ PostgreSQL conectado!"

echo "🔄 Verificando se as migrações são necessárias..."
if npx prisma migrate status | grep -q "Database schema is not up to date"; then
  echo "🔄 Executando migrations do Prisma..."
  npx prisma migrate deploy
else
  echo "✅ Database já está atualizado com as migrações"
fi

echo "🔄 Sincronizando schema do Prisma..."
npx prisma db push --accept-data-loss || echo "Schema já está sincronizado"

echo "🚀 Iniciando aplicação..."
exec npm start
