# Atualizar Domínio no Supabase

## Novo Domínio
O site agora está em: `https://cacauloversclub.vercel.app`

## Configuração no Supabase Dashboard

Você também precisa atualizar manualmente no Dashboard do Supabase:

1. Acesse: https://supabase.com/dashboard/project/xudfilvyvydckranlipn/settings/auth
2. Vá em **URL Configuration**
3. Atualize:
   - **Site URL**: `https://cacauloversclub.vercel.app`
   - **Redirect URLs**: Adicione:
     - `https://cacauloversclub.vercel.app`
     - `https://cacaulovers.club`
     - `https://www.cacaulovers.club`
4. Salve as alterações

## Por que isso é importante?

O Supabase precisa saber quais URLs são permitidas para:
- Redirecionamentos após autenticação
- CORS (Cross-Origin Resource Sharing)
- Validação de origem das requisições

## Verificação

Após atualizar, teste:
1. Acesse o site: `https://cacauloversclub.vercel.app`
2. Tente gerar um PIX
3. Verifique o console (F12) para erros de CORS

Se ainda houver erros de CORS relacionados ao Supabase, verifique também:
- Edge Functions → Settings → CORS
- Adicione `https://cacauloversclub.vercel.app` às origens permitidas
