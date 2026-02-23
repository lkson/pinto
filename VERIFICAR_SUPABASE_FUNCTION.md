# Verificar e Corrigir Supabase Edge Function

## Problema
A API PIX não está funcionando porque a Supabase Edge Function `smooth-endpoint` pode não estar deployada ou configurada corretamente.

## Verificação Rápida

### 1. Verificar se a função existe

1. Acesse: https://supabase.com/dashboard/project/xudfilvyvydckranlipn/functions
2. Procure pela função `smooth-endpoint`
3. Se **NÃO existir**, você precisa criá-la (veja passo 2)
4. Se **existir**, verifique se está ativa e faça redeploy (veja passo 3)

### 2. Criar a função (se não existir)

1. No Dashboard do Supabase, vá em **Edge Functions**
2. Clique em **Create Function**
3. Nome: `smooth-endpoint`
4. Cole o código completo abaixo:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  console.log('=== Edge Function smooth-endpoint chamada ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  
  // Handle CORS preflight requests - DEVE ser a primeira coisa
  if (req.method === 'OPTIONS') {
    console.log('Respondendo a requisição OPTIONS (preflight)')
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    })
  }

  // Aceitar apenas POST
  if (req.method !== 'POST') {
    console.log('Método não permitido:', req.method)
    return new Response(
      JSON.stringify({ error: 'Método não permitido. Use POST.' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    console.log('Processando requisição POST')
    
    // Verificar se há corpo na requisição
    let requestData = null
    try {
      const text = await req.text()
      console.log('Body recebido:', text)
      if (text) {
        requestData = JSON.parse(text)
        console.log('Request data parseado:', JSON.stringify(requestData))
      }
    } catch (e) {
      console.error('Erro ao parsear body:', e)
      return new Response(
        JSON.stringify({ error: 'Body inválido ou não fornecido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!requestData || !requestData.endpoint) {
      console.error('Endpoint não fornecido')
      return new Response(
        JSON.stringify({ error: 'Endpoint é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { endpoint, method, data } = requestData
    console.log('Fazendo requisição para:', endpoint)
    console.log('Method:', method)
    console.log('Data:', JSON.stringify(data))

    // Fazer a requisição para a API Duttyfy
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
    console.log('Resposta da API Duttyfy - Status:', response.status)
    
    let responseData
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json()
    } else {
      responseData = { data: await response.text() }
    }
    
    console.log('Resposta da API Duttyfy:', JSON.stringify(responseData))

    return new Response(
      JSON.stringify(responseData),
      { 
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Erro na Edge Function:', error)
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

5. Clique em **Deploy**
6. Aguarde a confirmação

### 3. Redeploy da função (se já existe)

1. No Dashboard, vá em **Edge Functions** → `smooth-endpoint`
2. Clique em **Edit**
3. Substitua TODO o código pelo código acima
4. Clique em **Deploy**
5. Aguarde a confirmação

### 4. Verificar logs

Após fazer deploy:

1. No Dashboard, vá em **Edge Functions** → `smooth-endpoint`
2. Clique na aba **Logs**
3. Tente gerar um PIX no site
4. Você deve ver logs aparecendo quando a função for chamada

### 5. Testar diretamente

Teste a função diretamente no navegador ou com curl:

```bash
curl -X POST https://xudfilvyvydckranlipn.supabase.co/functions/v1/smooth-endpoint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1ZGZpbHZ5dnlkY2tyYW5saXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1ODY4MDAsImV4cCI6MjA4NjE2MjgwMH0.jDevQSnfm25VYoT3jAIjKRLaxJDlQboGT_rNJoPT9v4" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1ZGZpbHZ5dnlkY2tyYW5saXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1ODY4MDAsImV4cCI6MjA4NjE2MjgwMH0.jDevQSnfm25VYoT3jAIjKRLaxJDlQboGT_rNJoPT9v4" \
  -d '{
    "endpoint": "https://www.pagamentos-seguros.app/api-pix/nIrv0PpV1RWaWsPlDqQfHkFrNNNc_RKCtUkq4wJ48zSmA_1mB9AVZhlk_TK-ddWBDcZj8czUJPk661W0zgn3iw",
    "method": "POST",
    "data": {
      "amount": 100,
      "description": "Teste",
      "customer": {
        "name": "Teste",
        "document": "12345678900",
        "email": "teste@teste.com",
        "phone": "11999999999"
      },
      "paymentMethod": "PIX"
    }
  }'
```

Se retornar um JSON com `pixCode`, a função está funcionando!

## Solução Alternativa Temporária

Se não conseguir fazer a função funcionar agora, você pode usar diretamente a URL da API PIX sem proxy, mas isso pode não funcionar devido a CORS. O ideal é ter a função Supabase funcionando.

## Próximos Passos

1. ✅ Verifique se a função existe
2. ✅ Crie ou faça redeploy da função
3. ✅ Verifique os logs
4. ✅ Teste gerando um PIX no site
5. ✅ Se ainda não funcionar, verifique o console do navegador (F12) para ver erros específicos
