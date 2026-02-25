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

/** Extrai o objeto transação (resposta InPago pode vir em body ou body.data) */
function getTransactionPayload(body: Record<string, unknown>): Record<string, unknown> {
  const data = body.data && typeof body.data === 'object' ? (body.data as Record<string, unknown>) : body
  return { ...data }
}

/** Normaliza resposta da InPago para o formato do frontend (pixCode, transactionId, status) */
function normalizeInPagoResponse(body: Record<string, unknown>): Record<string, unknown> {
  const data = getTransactionPayload(body)
  const out = { ...data }
  const pix = data.pix && typeof data.pix === 'object' ? (data.pix as Record<string, unknown>) : null
  // pixCode: InPago usa data.pix.qrcode
  if (out.pixCode == null) {
    out.pixCode = pix?.qrcode ?? data.qr_code ?? data.copiaCola ?? data.copia_cola
  }
  // transactionId: InPago usa id (número) ou secureId (string)
  if (out.transactionId == null) {
    const id = data.id ?? data.secureId ?? data.transaction_id
    out.transactionId = id != null ? String(id) : undefined
  }
  // status: normalizar "paid" -> "COMPLETED" para o frontend
  if (data.status != null && typeof data.status === 'string') {
    const s = (data.status as string).toLowerCase()
    if (s === 'paid' || s === 'concluido' || s === 'completed' || s === 'pago') out.status = 'COMPLETED'
    else out.status = (data.status as string).toUpperCase()
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
    const rawBody = await req.text()
    console.log('Body recebido - tamanho:', rawBody?.length ?? 0)
    try {
      if (rawBody && rawBody.trim()) requestData = JSON.parse(rawBody)
    } catch (e) {
      console.error('Erro ao parsear body:', e)
    }

    if (!requestData) {
      return new Response(
        JSON.stringify({ error: 'Corpo da requisição inválido ou vazio. Envie JSON com { method: "POST", data: { amount, paymentMethod: "pix", ... } }' }),
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
      // Montar payload no formato InPago: amount número, customer.document objeto, items array
      const numAmount = Number(data.amount)
      const amountCentavos = Number.isNaN(numAmount) ? 0 : Math.round(numAmount * 100)

      const customer = data.customer && typeof data.customer === 'object' ? (data.customer as Record<string, unknown>) : {}
      const doc = customer.document
      const customerInPago = { ...customer }
      if (doc !== undefined && doc !== null) {
        if (typeof doc === 'string') {
          customerInPago.document = { type: 'cpf', number: String(doc).replace(/\D/g, '') }
        } else if (typeof doc === 'object' && doc !== null && 'number' in (doc as Record<string, unknown>)) {
          customerInPago.document = doc
        } else {
          const num = (doc as Record<string, unknown>)?.number ?? doc
          customerInPago.document = { type: 'cpf', number: String(num).replace(/\D/g, '') }
        }
      }

      let items: Record<string, unknown>[] = []
      if (Array.isArray(data.items)) {
        items = data.items.map((it: unknown) => {
          const i = it && typeof it === 'object' ? (it as Record<string, unknown>) : {}
          const price = Number(i.price ?? i.unitPrice)
          return {
            title: i.title ?? 'Produto',
            quantity: typeof i.quantity === 'number' ? i.quantity : 1,
            tangible: true,
            unitPrice: Number.isNaN(price) ? 0 : Math.round(price * 100),
            externalRef: i.externalRef ?? `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          }
        })
      }
      const singleItem = data.item && typeof data.item === 'object' ? (data.item as Record<string, unknown>) : null
      if (items.length === 0 && singleItem) {
        const price = Number(singleItem.price ?? singleItem.unitPrice)
        items = [{
          title: singleItem.title ?? 'Produto',
          quantity: typeof singleItem.quantity === 'number' ? singleItem.quantity : 1,
          tangible: true,
          unitPrice: Number.isNaN(price) ? amountCentavos : Math.round(price * 100),
          externalRef: singleItem.externalRef ?? `item-${Date.now()}`,
        }]
      }

      const payloadInPago: Record<string, unknown> = {
        amount: amountCentavos,
        currency: data.currency ?? 'BRL',
        paymentMethod: data.paymentMethod ?? 'pix',
        externalRef: data.externalRef ?? `order-${Date.now()}`,
        customer: customerInPago,
        items,
      }
      if (data.description != null) payloadInPago.description = data.description
      if (data.metadata != null) payloadInPago.metadata = data.metadata
      if (data.postbackUrl != null) payloadInPago.postbackUrl = data.postbackUrl

      console.log('InPago: criando transação POST', url, 'amount:', payloadInPago.amount, 'items:', items.length)

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloadInPago),
      })

      const contentType = res.headers.get('content-type')
      let responseData: Record<string, unknown>
      if (contentType && contentType.includes('application/json')) {
        responseData = await res.json()
      } else {
        const text = await res.text()
        responseData = { error: text || 'Resposta não-JSON', raw: text }
      }
      // Garantir mensagem de erro legível quando InPago retorna 4xx/5xx
      if (!res.ok && !responseData.error) {
        responseData.error = (responseData as { message?: string }).message
          ?? (responseData.errors && Array.isArray(responseData.errors) && (responseData.errors[0] as string))
          ?? 'Erro ' + res.status + ' da API InPago'
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
