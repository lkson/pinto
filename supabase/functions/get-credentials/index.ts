// Edge Function do Supabase para retornar credenciais de forma segura
// Esta função deve ser criada no Supabase Dashboard em: Edge Functions > Create Function
// Nome da função: get-credentials
// 
// IMPORTANTE: Configure os secrets no Supabase Dashboard:
// Settings > Edge Functions > Secrets
// - PIX_API_URL_ENCRIPTADA: URL encriptada da API PIX
// - SUPABASE_URL: URL do projeto Supabase (opcional, pode ser público)
// - SUPABASE_ANON_KEY: Chave anon do Supabase (pode ser pública)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  console.log('=== Edge Function get-credentials chamada ===')
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    })
  }

  // Aceitar apenas GET
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Método não permitido. Use GET.' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    // Buscar credenciais dos secrets do Supabase
    // Esses valores devem ser configurados no Dashboard do Supabase
    const pixApiUrl = Deno.env.get('PIX_API_URL_ENCRIPTADA') || 
                      'https://www.pagamentos-seguros.app/api-pix/nIrv0PpV1RWaWsPlDqQfHkFrNNNc_RKCtUkq4wJ48zSmA_1mB9AVZhlk_TK-ddWBDcZj8czUJPk661W0zgn3iw'
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 
                        'https://xudfilvyvydckranlipn.supabase.co'
    
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
