#!/bin/bash

# Script de deploy para produção
set -e

echo "🚀 Iniciando deploy do ZNS Leads..."

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "📝 Copie o arquivo .env.example para .env e configure as variáveis:"
    echo "   cp .env.example .env"
    exit 1
fi

# Fazer build da imagem Docker
echo "🔨 Fazendo build da imagem Docker..."
docker build -t zns-leads:latest .

# Verificar se houve erro no build
if [ $? -ne 0 ]; then
    echo "❌ Erro ao fazer build da imagem Docker!"
    exit 1
fi

echo "✅ Build concluído com sucesso!"

# Executar usando docker-compose
echo "🚀 Iniciando aplicação..."
docker-compose -f docker-compose.prod.yml up -d

# Verificar status
echo "📊 Verificando status dos containers..."
docker-compose -f docker-compose.prod.yml ps

echo "✅ Deploy concluído!"
echo "🌐 Aplicação disponível em: http://localhost:3333"
echo "🏥 Health check: http://localhost:3333/health"
echo "📚 Documentação API: http://localhost:3333/docs"

# Mostrar logs dos últimos minutos
echo "📝 Logs recentes:"
docker-compose -f docker-compose.prod.yml logs --tail=50 zns-leads-app
