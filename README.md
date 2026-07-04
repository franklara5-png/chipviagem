# ChipViagem

Site de venda de eSIMs de viagem para brasileiros, com pagamento via Pix e cartão (Asaas).

**Tagline:** Conectado em qualquer lugar do mundo.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Drizzle ORM + Neon (Postgres serverless)
- Asaas API v3 (Pix + cartão)
- Cloudflare Turnstile
- Resend (e-mail)
- Deploy: Vercel

## Setup local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 3. Criar tabelas no banco
npm run db:push

# 4. Popular catálogo e destinos
npm run db:seed

# 5. Criar usuário admin
npm run db:seed-admin

# 6. Rodar em desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). Admin em `/admin/login`.

## Fluxo de teste ponta a ponta

1. Configure `ASAAS_API_KEY` com chave sandbox do [Asaas](https://sandbox.asaas.com)
2. Configure webhook no painel Asaas apontando para `https://seu-dominio/api/webhooks/asaas`
3. Use `ngrok` ou similar para testar webhooks localmente
4. Compre um plano em `/planos` → checkout com Pix sandbox
5. Após pagamento confirmado, webhook provisiona eSIM via MockProvider
6. Acesse `/pedido/[publicId]` para ver QR code

## Plugando um fornecedor real

1. Implemente a interface `EsimProvider` em `src/lib/providers/types.ts`
2. Crie o arquivo (ex: `src/lib/providers/esimaccess.ts`)
3. Registre em `src/lib/providers/index.ts` no switch de `getProvider()`
4. Defina `ESIM_PROVIDER=esimaccess` no `.env`
5. No admin, clique em "Importar catálogo" para sincronizar planos

A interface exige: `getCatalog`, `getPlan`, `createOrder`, `getOrderStatus`, `getEsimDetails`.

## Deploy na Vercel

1. Conecte o repositório na Vercel
2. Configure todas as variáveis do `.env.example` no painel
3. Use Neon para `DATABASE_URL` (integração nativa Vercel + Neon)
4. Após deploy, rode `npm run db:push` e `npm run db:seed` via CI ou localmente apontando para o banco de produção
5. Configure webhook Asaas com URL de produção

## Estrutura principal

```
src/
  app/              # Páginas e API routes
  components/       # UI compartilhada
  db/               # Schema Drizzle
  lib/
    providers/      # Adapter do fornecedor eSIM
    seo.ts          # getSeoMetadata()
    asaas.ts        # Pagamentos
    orders.ts       # Provisionamento
content/blog/       # Posts MDX
scripts/            # Seed e admin
```

## Empresa

Altivia — CNPJ 63.101.423/0001-18
