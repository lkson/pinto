// Edge Function do Supabase para fazer proxy das chamadas à API PIX
// Esta função deve ser criada no Supabase Dashboard em: Edge Functions > Create Function
// Nome da função: pix-proxy

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { endpoint, method, data } = await req.json()

    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: 'Endpoint é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fazer a requisição para a API Duttyfy
    const response = await fetch(endpoint, {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    const responseData = await response.json()

    return new Response(
      JSON.stringify(responseData),
      { 
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
