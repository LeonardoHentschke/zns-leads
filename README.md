# ZNS Leads

Sistema de gestão de leads para aposentadoria e direito dos atletas.

## Funcionalidades

- [x] Cadastro de leads de aposentadoria
- [x] Cadastro de leads de direito dos atletas
- [x] Consulta de leads por ID
- [x] Emissão de webhooks após cadastro bem-sucedido
- [x] Documentação Swagger da API

## Webhooks

O sistema emite webhooks automaticamente quando um lead é cadastrado com sucesso no banco de dados. 

### Configuração

Configure as URLs dos webhooks nas variáveis de ambiente:

```bash
# Para leads de aposentadoria
WEBHOOK_RETIRED_URL=https://exemplo.com/webhooks/aposentados

# Para leads de direito dos atletas  
WEBHOOK_ATHLETES_RIGHTS_URL=https://exemplo.com/webhooks/direito-atletas
```

### Formato dos Webhooks

Os webhooks são enviados via POST com o seguinte formato JSON:

```json
{
  "type": "retired" | "athletes-rights",
  "data": {
    "id": 123,
    "name": "João Silva",
    "phone": "(11) 99999-9999",
    // ... outros campos do lead
    "created_at": "2025-06-12T10:30:00Z",
    "updated_at": "2025-06-12T10:30:00Z"
  },
  "timestamp": "2025-06-12T10:30:00Z"
}
```

### Headers

- `Content-Type: application/json`
- `User-Agent: ZNS-Leads-Webhook/1.0`

### Timeout e Tratamento de Erros

- Timeout de 10 segundos
- Erros de webhook não interrompem o fluxo principal
- Logs de erro são registrados no console

## Documentação da API

Para acessar a documentação Swagger, execute o projeto e acesse: `http://localhost:3000/docs`

## Desenvolvimento

### Pré-requisitos

- Node.js 18+
- PostgreSQL
- Docker (opcional)

### Instalação

```bash
```bash
# Clone o repositório
git clone <url-do-repositorio>
cd zns-leads

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Execute as migrações do banco
npm run db:migrate

# Inicie o servidor de desenvolvimento
npm run dev
```

### Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor em modo de desenvolvimento
npm run build        # Build da aplicação
npm start           # Inicia servidor em produção

# Banco de dados
npm run db:migrate  # Executa migrações
npm run db:studio   # Abre Prisma Studio
```

## Estrutura do Projeto

```
src/
├── lib/
│   ├── prisma.ts     # Cliente Prisma
│   └── webhook.ts    # Serviço de webhooks
├── routes/
│   ├── retired.ts           # Rotas de aposentadoria
│   ├── athletes-rights.ts   # Rotas de direito dos atletas
│   └── _errors/
│       └── bad-request.ts   # Tratamento de erros
├── auth.ts           # Autenticação Bearer
├── env.ts           # Validação de variáveis de ambiente
├── error-handler.ts # Manipulador global de erros
└── server.ts        # Configuração do servidor Fastify
```