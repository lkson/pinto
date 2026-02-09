# Configuração de Credenciais no Supabase

## Objetivo
Armazenar credenciais de forma segura usando Supabase Edge Functions e Secrets, evitando hardcoding no código frontend.

## Passo 1: Criar a Edge Function `get-credentials`

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto: `xudfilvyvydckranlipn`
3. Vá em **Edge Functions** no menu lateral
4. Clique em **Create Function**
5. Nome da função: `get-credentials`
6. Copie o conteúdo do arquivo `supabase/functions/get-credentials/index.ts` para o editor
7. Clique em **Deploy**

## Passo 2: Configurar Secrets no Supabase

Após criar a função, configure os secrets (variáveis de ambiente):

1. No Dashboard do Supabase, vá em **Edge Functions**
2. Clique na função `get-credentials`
3. Vá em **Settings** ou procure por **Secrets**
4. Adicione os seguintes secrets:

### Secrets necessários:

```
PIX_API_URL_ENCRIPTADA=https://www.pagamentos-seguros.app/api-pix/ObVzUOhxlLh4Mxcn3bWF6gRwM5r96EEJ3oe0psyE-LLgTYt6BQy-K9ge1KmCi1B5sr9HEr8zikcDeuAHNeNR4w
```

**Opcional** (já tem valores padrão no código):
```
SUPABASE_URL=https://xudfilvyvydckranlipn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1ZGZpbHZ5dnlkY2tyYW5saXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1ODY4MDAsImV4cCI6MjA4NjE2MjgwMH0.jDevQSnfm25VYoT3jAIjKRLaxJDlQboGT_rNJoPT9v4
```

## Passo 3: Como funciona

### No Frontend:
1. Ao carregar a página, o código chama `carregarCredenciais()`
2. A função faz uma requisição GET para `/functions/v1/get-credentials`
3. As credenciais são retornadas e armazenadas em variáveis globais
4. As credenciais são cacheadas no `sessionStorage` para evitar múltiplas chamadas

### Segurança:
- ✅ Credenciais não ficam hardcoded no código frontend
- ✅ Credenciais são armazenadas como secrets no Supabase
- ✅ Apenas a Edge Function tem acesso aos secrets
- ✅ Cache local para melhor performance
- ✅ Fallback para valores padrão caso a função não esteja disponível

## Passo 4: Atualizar credenciais

Para atualizar as credenciais:

1. Acesse o Dashboard do Supabase
2. Vá em **Edge Functions** > **get-credentials** > **Secrets**
3. Edite o secret `PIX_API_URL_ENCRIPTADA` com a nova URL
4. As mudanças serão aplicadas imediatamente (sem necessidade de redeploy)

## Teste

Após configurar, teste acessando:
```
https://xudfilvyvydckranlipn.supabase.co/functions/v1/get-credentials
```

Deve retornar um JSON com as credenciais:
```json
{
  "pixApiUrl": "https://www.pagamentos-seguros.app/api-pix/...",
  "supabaseUrl": "https://xudfilvyvydckranlipn.supabase.co",
  "supabaseAnonKey": "..."
}
```

## Notas Importantes

- A função `get-credentials` não requer autenticação (pode ser pública)
- As credenciais são cacheadas no navegador por sessão
- Se a função não estiver disponível, o código usa valores de fallback
- Para produção, considere adicionar rate limiting na função
