// Edge Function do Supabase para retornar credenciais de forma segura
// Nome da função: get-credentials
//
// PIX: o fluxo usa a Edge Function pix-proxy com API InPago (api.inpagamentos.com).
// Configure em Edge Functions > Secrets: INPAG_PUBLIC_KEY, INPAG_SECRET_KEY.
// Opcional aqui: PIX_API_URL_ENCRIPTADA (legado), SUPABASE_URL, SUPABASE_ANON_KEY.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  console.log('=== Edge Function get-credentials chamada ===', req.method)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    })
  }

  // Aceitar GET e POST (alguns gateways/proxies alteram o método)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método não permitido. Use GET ou POST.' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 
                        'https://xudfilvyvydckranlipn.supabase.co'
    
    // PIX é feito via pix-proxy (InPago). pixApiUrl aponta para o proxy.
    const pixApiUrl = Deno.env.get('PIX_API_URL_ENCRIPTADA') || 
                      (supabaseUrl + '/functions/v1/pix-proxy')
    
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || 
                            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1ZGZpbHZ5dnlkY2tyYW5saXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1ODY4MDAsImV4cCI6MjA4NjE2MjgwMH0.jDevQSnfm25VYoT3jAIjKRLaxJDlQboGT_rNJoPT9v4'

    // Retornar apenas as credenciais necessárias
    const credentials = {
      pixApiUrl: pixApiUrl,
      supabaseUrl: supabaseUrl,
      supabaseAnonKey: supabaseAnonKey
    }

    console.log('Credenciais retornadas (sem expor valores completos)')

    return new Response(
      JSON.stringify(credentials),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Erro ao buscar credenciais:', error)
    return new Response(
      JSON.stringify({ error: 'Erro ao buscar credenciais' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
