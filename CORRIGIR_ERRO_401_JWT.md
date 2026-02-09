# Corrigir Erro 401 - Invalid JWT

## Problema
A Supabase Edge Function `smooth-endpoint` está retornando erro 401 "Invalid JWT", impedindo o acesso à API PIX.

## Causa
O Supabase está validando o JWT antes de chegar na função. A função precisa ser configurada como **pública** ou usar autenticação correta.

## Solução 1: Tornar a Função Pública (RECOMENDADO)

### Passo 1: Acessar Configurações da Função
1. Acesse: https://supabase.com/dashboard/project/xudfilvyvydckranlipn/functions/smooth-endpoint
2. Vá em **Settings** ou procure por **Invoke URL**
3. Procure por opções de **Authentication** ou **Public Access**

### Passo 2: Tornar Pública
- Se houver opção "Make this function public" ou "Public Access", ative
- Ou procure por "Require Authentication" e desative

### Passo 3: Verificar RLS (Row Level Security)
Se não encontrar opção de tornar pública, pode ser necessário:
1. Dashboard → **Database** → **Policies**
2. Verificar se há políticas bloqueando

## Solução 2: Atualizar Código para Não Requerer Autenticação

Se não conseguir tornar a função pública, podemos tentar chamar sem autenticação:

```javascript
// Tentar sem autenticação primeiro
fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({...})
})
```

## Solução 3: Usar Service Role Key (NÃO RECOMENDADO para frontend)

⚠️ **ATENÇÃO**: Service Role Key nunca deve ser exposta no frontend!

Se precisar usar autenticação, use apenas no backend.

## Solução 4: Verificar se a Função Está Deployada Corretamente

1. Dashboard → **Edge Functions** → `smooth-endpoint`
2. Verifique se está **Active** e **Deployed**
3. Verifique os **Logs** para ver se a função está sendo chamada

## Solução 5: Atualizar a Função com Código que Não Requer Autenticação

A função atual não verifica autenticação, mas o Supabase pode estar bloqueando antes. 

### Código atualizado da função (sem verificação de auth):

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight - SEMPRE primeiro
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    })
  }

  // Aceitar apenas POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método não permitido. Use POST.' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    const text = await req.text()
    const requestData = JSON.parse(text)
    
    if (!requestData || !requestData.endpoint) {
      return new Response(
        JSON.stringify({ error: 'Endpoint é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { endpoint, method, data } = requestData

    const fetchOptions: RequestInit = {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(data)
    }

    const response = await fetch(endpoint, fetchOptions)
    
    let responseData
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json()
    } else {
      responseData = { data: await response.text() }
    }

    return new Response(
      JSON.stringify(responseData),
      { 
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
```

## Verificação Rápida

1. ✅ A função está deployada?
2. ✅ A função está ativa?
3. ✅ A função está configurada como pública?
4. ✅ Os logs mostram a função sendo chamada?

## Próximos Passos

1. **Primeiro**: Tente tornar a função pública no Dashboard
2. **Segundo**: Se não conseguir, atualize o código da função com o código acima
3. **Terceiro**: Faça redeploy da função
4. **Quarto**: Teste novamente

## Alternativa Temporária

Enquanto isso, o código já tem fallback para proxies CORS públicos, mas eles também estão falhando com 400 Bad Request. O ideal é corrigir a função Supabase.
