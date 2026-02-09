# Debug - Supabase Edge Function não está sendo chamada

## Problema
A função `pix-proxy` no Supabase não está sendo chamada e não aparece nenhum log.

## Checklist de Verificação

### 1. Verificar se a função está deployada
- Acesse: https://supabase.com/dashboard/project/xudfilvyvydckranlipn/functions
- Verifique se a função `pix-proxy` existe e está com status "Active"
- Se não existir, crie uma nova função com o nome `pix-proxy`
- Cole o código do arquivo `supabase-edge-function-pix-proxy.ts`

### 2. Verificar logs no Supabase
- No Dashboard do Supabase, vá em **Edge Functions** > **pix-proxy** > **Logs**
- Verifique se há algum log de erro ou requisição

### 3. Verificar no Console do Navegador
Agora o código tem logs de debug. Abra o Console do navegador (F12) e verifique:
- Se aparece "Chamando Supabase Edge Function: ..."
- Se aparece algum erro antes da chamada
- Qual é o status da resposta

### 4. Verificar URL da função
A URL deve ser exatamente:
```
https://xudfilvyvydckranlipn.supabase.co/functions/v1/pix-proxy
```

### 5. Testar manualmente a função
Você pode testar a função diretamente usando curl ou Postman:

```bash
curl -X POST https://xudfilvyvydckranlipn.supabase.co/functions/v1/pix-proxy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1ZGZpbHZ5dnlkY2tyYW5saXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1ODY4MDAsImV4cCI6MjA4NjE2MjgwMH0.jDevQSnfm25VYoT3jAIjKRLaxJDlQboGT_rNJoPT9v4" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1ZGZpbHZ5dnlkY2tyYW5saXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1ODY4MDAsImV4cCI6MjA4NjE2MjgwMH0.jDevQSnfm25VYoT3jAIjKRLaxJDlQboGT_rNJoPT9v4" \
  -d '{
    "endpoint": "https://app.duttyfy.com.br/api-pix/GcUMYUZW7Z4Mhd1SFxv_aV-URlF6u2iUg5L3xcC2j0ZSDfKvwBu5lQ8yBrrB32ccWwpeL83wlDEwZyoxOi1JCA",
    "method": "GET",
    "data": null
  }'
```

### 6. Possíveis Problemas

#### Problema: CORS bloqueando antes de chegar ao Supabase
**Solução**: A Edge Function agora tem logs detalhados. Se a requisição não chegar ao Supabase, você verá o erro no console do navegador.

#### Problema: Função não está deployada
**Solução**: Certifique-se de que a função está criada e deployada no Supabase Dashboard.

#### Problema: Nome da função incorreto
**Solução**: O nome deve ser exatamente `pix-proxy` (com hífen, tudo minúsculo).

#### Problema: API Key incorreta
**Solução**: Verifique se a API Key está correta nos arquivos `checkout.html` e `pagamento-pix.html`.

## Próximos Passos

1. Abra o Console do navegador (F12) ao tentar gerar um PIX
2. Verifique os logs que aparecem
3. Compartilhe os logs para identificarmos onde está o problema
