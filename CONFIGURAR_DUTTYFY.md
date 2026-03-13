# Configurar Duttyfy para PIX

O projeto usa **Duttyfy** como gateway de pagamento PIX. O frontend nunca chama a API da Duttyfy diretamente — todas as chamadas passam pelo backend (Supabase Edge Function).

## 1. Obter a Encrypted URL

1. Acesse o painel da Duttyfy
2. Vá em **Integrations and Keys** → **API Keys**
3. Clique em **"Generate Encrypted URL"**
4. Copie a URL completa (ex.: `https://www.pagamentos-seguros.app/api-pix/EtvpI0R3Z4...`)

⚠️ **Importante:** A URL é a credencial. Nunca exponha em frontend, logs ou repositório.

## 2. Configurar no Supabase

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione o projeto
3. Vá em **Edge Functions** → **Secrets** (ou **Project Settings** → **Edge Functions** → **Secrets**)
4. Adicione o secret:
   - **Nome:** `DUTTYFY_PIX_URL_ENCRYPTED`
   - **Valor:** a URL completa copiada do painel Duttyfy

## 3. Fazer deploy da Edge Function

```bash
supabase functions deploy pix-proxy
```

Ou via Supabase Dashboard: **Edge Functions** → **pix-proxy** → **Deploy**.

## 4. Testar

1. Inicie o servidor local: `npm start`
2. Adicione um produto ao carrinho e vá ao checkout
3. Preencha o formulário (nome, CPF, email, telefone com DDD)
4. Clique em **Finalizar Compra** para gerar o PIX
5. Pague o PIX no app do banco
6. A página deve detectar o pagamento e exibir "Pagamento confirmado!"

## Formato dos dados

O checkout coleta:
- **Nome completo** → `customer.name`
- **CPF** (11 dígitos) → `customer.document` (apenas dígitos)
- **Email** → `customer.email`
- **Telefone com DDD** (10 ou 11 dígitos) → `customer.phone` (apenas dígitos)

Todos os campos são obrigatórios. O telefone é exigido pela Duttyfy — sem ele a cobrança falha.

## Troubleshooting

| Erro | Solução |
|------|---------|
| `Configure DUTTYFY_PIX_URL_ENCRYPTED` | Adicione o secret no Supabase |
| `401` | A Encrypted URL está inválida ou revogada. Gere uma nova no painel Duttyfy |
| `Telefone inválido` | Use 10 ou 11 dígitos com DDD (ex.: 11987654321) |
| `CPF/CNPJ inválido` | Use 11 dígitos (CPF) ou 14 (CNPJ), sem pontuação |
