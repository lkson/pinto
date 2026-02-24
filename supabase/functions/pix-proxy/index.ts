// Edge Function do Supabase - Proxy para API InPago (inpagamentos.com)
// Autenticação: Basic (publicKey:secretKey) conforme documentação InPago
// Configure no Supabase: Edge Functions > Secrets > INPAG_PUBLIC_KEY e INPAG_SECRET_KEY

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const INPAG_BASE_URL = 'https://api.inpagamentos.com/v1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

function buildBasicAuth(publicKey: string, secretKey: string): string {
  const credentials = publicKey + ':' + secretKey
  const encoded = btoa(credentials)
  return 'Basic ' + encoded
}

/** Normaliza resposta da InPago para o formato esperado pelo frontend (pixCode, transactionId, status) */
function normalizeInPagoResponse(body: Record<string, unknown>): Record<string, unknown> {
  const out = { ...body }
  // Mapeamentos comuns de nomes de campos (InPago pode usar variações)
  if (body.pixCode == null && (body.qr_code != null || body.copiaCola != null || body.copia_cola != null)) {
    out.pixCode = body.qr_code ?? body.copiaCola ?? body.copia_cola
  }
  if (body.transactionId == null && (body.id != null || body.transaction_id != null)) {
    out.transactionId = body.id ?? body.transaction_id
  }
  if (body.status != null && typeof body.status === 'string') {
    const s = (body.status as string).toUpperCase()
    if (s === 'PAID' || s === 'CONCLUIDO' || s === 'COMPLETED') out.status = 'COMPLETED'
    else out.status = s
  }
  return out
}

serve(async (req) => {
  console.log('=== Edge Function pix-proxy (InPago) chamada ===')
  console.log('Method:', req.method)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const publicKey = Deno.env.get('INPAG_PUBLIC_KEY')
    const secretKey = Deno.env.get('INPAG_SECRET_KEY')
    if (!publicKey || !secretKey) {
      console.error('INPAG_PUBLIC_KEY ou INPAG_SECRET_KEY não configurados nos Secrets da Edge Function')
      return new Response(
        JSON.stringify({ error: 'Configuração de chaves InPago ausente. Configure INPAG_PUBLIC_KEY e INPAG_SECRET_KEY nos Secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const auth = buildBasicAuth(publicKey, secretKey)

    let requestData: { endpoint?: string; method?: string; data?: Record<string, unknown>; transactionId?: string } | null = null
    try {
      const text = await req.text()
      if (text) requestData = JSON.parse(text)
    } catch (e) {
      console.error('Erro ao parsear body:', e)
    }

    if (!requestData) {
      return new Response(
        JSON.stringify({ error: 'Corpo da requisição inválido ou vazio' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const method = (requestData.method || 'GET').toUpperCase()
    // Aceitar payload em requestData.data ou no root (ex.: { amount, paymentMethod, ... })
    let data = requestData.data
    if (method === 'POST' && !data && typeof requestData === 'object' && 'amount' in requestData) {
      data = requestData as Record<string, unknown>
    }

    // ----- Criar transação PIX (POST)
    if (method === 'POST' && data && typeof data === 'object' && 'amount' in data) {
      const url = INPAG_BASE_URL + '/transactions'
      console.log('InPago: criando transação POST', url)

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const contentType = res.headers.get('content-type')
      let responseData: Record<string, unknown>
      if (contentType && contentType.includes('application/json')) {
        responseData = await res.json()
      } else {
        const text = await res.text()
        responseData = { error: text || 'Resposta não-JSON', raw: text }
      }

      const normalized = normalizeInPagoResponse(responseData)
      console.log('InPago create - Status:', res.status, 'Body:', JSON.stringify(normalized))

      return new Response(JSON.stringify(normalized), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ----- Consultar status (GET) - transactionId no query do endpoint ou no body
    let transactionId = requestData.transactionId
    if (!transactionId && requestData.endpoint) {
      try {
        const u = new URL(requestData.endpoint)
        transactionId = u.searchParams.get('transactionId') || undefined
      } catch (_) {
        // ignorar
      }
    }
    if (method === 'GET' && transactionId) {
      const url = INPAG_BASE_URL + '/transactions/' + encodeURIComponent(transactionId)
      console.log('InPago: consultando status GET', url)

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': auth,
          'Content-Type': 'application/json',
        },
      })

      const contentType = res.headers.get('content-type')
      let responseData: Record<string, unknown>
      if (contentType && contentType.includes('application/json')) {
        responseData = await res.json()
      } else {
        const text = await res.text()
        responseData = { data: text }
      }

      const normalized = normalizeInPagoResponse(responseData)
      console.log('InPago status - Status:', res.status)

      return new Response(JSON.stringify(normalized), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({ error: 'Requisição inválida. Use POST com { data: { amount, paymentMethod, ... } } para criar PIX ou GET com transactionId para consultar status.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erro na Edge Function pix-proxy:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message || 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
