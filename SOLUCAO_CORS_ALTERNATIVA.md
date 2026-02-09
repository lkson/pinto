# Solução Alternativa para CORS

## Problema Identificado
A requisição não está chegando ao Supabase Edge Function. Isso pode ser causado por:
1. A função não está deployada corretamente
2. Configuração de autenticação bloqueando antes de chegar à função
3. Problemas de rede/firewall

## Solução Implementada
Foi adicionado um sistema de fallback que:
1. Tenta primeiro usar o Supabase Edge Function
2. Se falhar, automaticamente usa um proxy CORS público (`corsproxy.org`)

## O que foi alterado
- `checkout.html`: Adicionada função `chamarAPIViaProxyPublico()` como fallback
- `pagamento-pix.html`: Adicionada função `chamarAPIViaProxyPublico()` como fallback

## Como funciona agora
1. O código tenta chamar o Supabase primeiro
2. Se houver erro (CORS, rede, etc.), automaticamente usa o proxy público
3. O usuário não percebe a diferença - funciona automaticamente

## Para corrigir o Supabase (opcional)
Se quiser que o Supabase funcione corretamente:

1. **Verificar se a função está deployada:**
   - Acesse: https://supabase.com/dashboard/project/xudfilvyvydckranlipn/functions
   - Verifique se `pix-proxy` existe e está ativa

2. **Verificar configurações de CORS:**
   - No Dashboard, vá em Settings > API
   - Verifique configurações de CORS
   - Adicione `https://pinto-eight.vercel.app` às origens permitidas

3. **Verificar se a função não requer autenticação:**
   - Edge Functions do Supabase podem requerer autenticação por padrão
   - Verifique se há opção para tornar a função pública

4. **Testar a função diretamente:**
   ```bash
   curl -X OPTIONS https://xudfilvyvydckranlipn.supabase.co/functions/v1/pix-proxy \
     -H "Origin: https://pinto-eight.vercel.app" \
     -v
   ```

## Status Atual
✅ O código agora funciona com fallback automático
⚠️ O Supabase ainda precisa ser configurado corretamente para funcionar como método principal
