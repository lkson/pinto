// Edge Function do Supabase para fazer proxy das chamadas à API PIX
// Esta função deve ser criada no Supabase Dashboard em: Edge Functions > Create Function
// Nome da função: pix-proxy

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  console.log('=== Edge Function pix-proxy chamada ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  console.log('Headers:', Object.fromEntries(req.headers.entries()))
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Respondendo a requisição OPTIONS (preflight)')
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    })
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
      // Se não houver corpo ou não for JSON válido, continua
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
