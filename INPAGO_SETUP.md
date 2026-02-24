# Configuração PIX com InPago

O fluxo de PIX usa a API **InPago** (api.inpagamentos.com) via Edge Function `pix-proxy` no Supabase.

## 1. Secrets no Supabase

No **Supabase Dashboard** do projeto:

1. Vá em **Edge Functions** → **Secrets** (ou **Project Settings** → **Edge Functions** → **Secrets**).
2. Cadastre:
   - **INPAG_PUBLIC_KEY**: sua chave pública InPago (menu Integrações na conta InPago).
   - **INPAG_SECRET_KEY**: sua chave secreta InPago.

As chaves já configuradas no Cursor/ambiente local precisam estar **também** nos Secrets da Edge Function no Supabase, pois o `pix-proxy` roda no servidor Supabase.

## 2. Chave anônima do Supabase no frontend

Para o site chamar a Edge Function `pix-proxy`, é necessário enviar a **chave anônima (anon key)** do Supabase:

1. No Supabase: **Project Settings** → **API** → copie a **anon public** key.
2. Nos arquivos **checkout.html** e **pagamento-pix.html**, defina:
   ```javascript
   var SUPABASE_ANON_KEY_OVERRIDE = 'COLE_SUA_ANON_KEY_AQUI';
   ```
   (Substitua `COLE_SUA_ANON_KEY_AQUI` pela chave copiada.)

Sem essa variável, o checkout e a página de PIX não conseguem chamar o proxy e exibirão erro pedindo para configurar.

## 3. Deploy da Edge Function

Garanta que a função `pix-proxy` está criada e publicada:

```bash
supabase functions deploy pix-proxy
```

Ou crie/deploy pelo Dashboard: **Edge Functions** → **Create Function** / **Deploy**, usando o código em `supabase/functions/pix-proxy/index.ts`.

## 4. Autenticação (conforme documentação InPago)

- **Método**: Basic Access Authentication.
- **Header**: `Authorization: Basic base64(publicKey + ':' + secretKey)`.
- **Criação de transação**: `POST https://api.inpagamentos.com/v1/transactions` com JSON (amount, paymentMethod: 'pix', customer, item, etc.).
- **Consulta de status**: `GET https://api.inpagamentos.com/v1/transactions/:id`.

O `pix-proxy` faz essas chamadas usando os secrets **INPAG_PUBLIC_KEY** e **INPAG_SECRET_KEY**.
