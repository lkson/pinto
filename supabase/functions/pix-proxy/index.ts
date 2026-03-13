// Edge Function do Supabase - Proxy para API Duttyfy (PIX)
// Autenticação: Encrypted URL (a URL é a credencial)
// Configure no Supabase: Edge Functions > Secrets > DUTTYFY_PIX_URL_ENCRYPTED
// Painel Duttyfy: Integrations and Keys > API Keys > "Generate Encrypted URL"

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

/** Extrai dígitos de document (CPF/CNPJ) */
function digitsOnly(val: unknown): string {
  if (val == null) return ''
  if (typeof val === 'object' && val !== null && 'number' in (val as Record<string, unknown>)) {
    return String((val as Record<string, unknown>).number || '').replace(/\D/g, '')
  }
  return String(val).replace(/\D/g, '')
}

/** Retry com exponential backoff (1s, 2s, 4s, max 3 tentativas) - apenas para 5xx/timeout */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxAttempts = 3
): Promise<Response> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      const res = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timeoutId)
      if (res.status >= 400 && res.status < 500) return res
      if (res.ok) return res
      lastError = new Error(`HTTP ${res.status}`)
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))
    }
    if (attempt < maxAttempts - 1) {
      const delay = Math.pow(2, attempt) * 1000
      await new Promise((r) => setTimeout(r, delay))
    }
  }
  throw lastError || new Error('Retry exhausted')
}

serve(async (req) => {
  const urlSuffix = '(last 8)'
  console.log('=== Edge Function pix-proxy (Duttyfy) chamada ===')
  console.log('Method:', req.method)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const duttyfyUrl = Deno.env.get('DUTTYFY_PIX_URL_ENCRYPTED')
    if (!duttyfyUrl || !duttyfyUrl.startsWith('https://')) {
      console.error('DUTTYFY_PIX_URL_ENCRYPTED não configurado nos Secrets')
      return new Response(
        JSON.stringify({ error: 'Configure DUTTYFY_PIX_URL_ENCRYPTED nos Secrets do Supabase.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    console.log('Duttyfy URL', urlSuffix, duttyfyUrl.slice(-8))

    let requestData: { method?: string; data?: Record<string, unknown>; transactionId?: string } | null = null
    const rawBody = await req.text()
    try {
      if (rawBody && rawBody.trim()) requestData = JSON.parse(rawBody)
    } catch (e) {
      console.error('Erro ao parsear body:', e)
    }

    if (!requestData) {
      return new Response(
        JSON.stringify({ error: 'Corpo inválido. Envie JSON com { method, data } ou { transactionId } para GET.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const method = (requestData.method || 'GET').toUpperCase()
    let data = requestData.data
    if (method === 'POST' && !data && typeof requestData === 'object' && 'amount' in requestData) {
      data = requestData as Record<string, unknown>
    }

    // ----- Criar cobrança PIX (POST)
    if (method === 'POST' && data && typeof data === 'object' && 'amount' in data) {
      const numAmount = Number(data.amount)
      const amountReais = Number.isNaN(numAmount) ? 0 : numAmount
      const amountCentavos = Math.round(amountReais * 100)
      if (amountCentavos < 100) {
        return new Response(
          JSON.stringify({ error: 'Valor mínimo é R$ 1,00 (100 centavos)' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const customer = data.customer && typeof data.customer === 'object' ? (data.customer as Record<string, unknown>) : {}
      const doc = digitsOnly(customer.document)
      const phone = digitsOnly(customer.phone)
      if (doc.length !== 11 && doc.length !== 14) {
        return new Response(
          JSON.stringify({ error: 'CPF/CNPJ inválido. Deve ter 11 ou 14 dígitos.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      if (phone.length < 10 || phone.length > 11) {
        return new Response(
          JSON.stringify({ error: 'Telefone inválido. Deve ter 10 ou 11 dígitos com DDD.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const singleItem = data.item && typeof data.item === 'object' ? (data.item as Record<string, unknown>) : null
      const itemPriceReais = singleItem ? Number(singleItem.price ?? singleItem.unitPrice) : amountReais
      const itemPriceCentavos = Number.isNaN(itemPriceReais) ? amountCentavos : Math.round(itemPriceReais * 100)
      const itemQty = singleItem && typeof singleItem.quantity === 'number' ? singleItem.quantity : 1

      const payloadDuttyfy = {
        amount: amountCentavos,
        customer: {
          name: String(customer.name || '').trim() || 'Cliente',
          document: doc,
          email: String(customer.email || '').trim() || 'cliente@example.com',
          phone: phone,
        },
        item: {
          title: String(singleItem?.title || 'Produto').trim() || 'Produto',
          price: Math.max(1, itemPriceCentavos),
          quantity: Math.max(1, itemQty),
        },
        paymentMethod: 'PIX',
      }
      if (data.description != null && String(data.description).trim()) {
        ;(payloadDuttyfy as Record<string, unknown>).description = String(data.description).trim()
      }
      if (data.utm != null && String(data.utm).trim()) {
        ;(payloadDuttyfy as Record<string, unknown>).utm = String(data.utm).trim()
      }

      console.log('Duttyfy: criando PIX, amount:', amountCentavos, 'cents')

      const res = await fetchWithRetry(duttyfyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadDuttyfy),
      })

      const contentType = res.headers.get('content-type')
      let responseData: Record<string, unknown>
      if (contentType && contentType.includes('application/json')) {
        responseData = await res.json()
      } else {
        const text = await res.text()
        responseData = { error: text || 'Resposta não-JSON', raw: text }
      }

      if (!res.ok) {
        const errMsg = (responseData.error as string) || (responseData as { message?: string }).message || `Erro ${res.status} Duttyfy`
        return new Response(
          JSON.stringify({ error: errMsg }),
          { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const out = {
        pixCode: responseData.pixCode,
        transactionId: responseData.transactionId,
        status: responseData.status || 'PENDING',
      }
      console.log('Duttyfy create OK, transactionId:', out.transactionId)
      return new Response(JSON.stringify(out), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ----- Consultar status (GET)
    let transactionId = requestData.transactionId
    if (method === 'GET' && transactionId) {
      const statusUrl = duttyfyUrl + (duttyfyUrl.includes('?') ? '&' : '?') + 'transactionId=' + encodeURIComponent(transactionId)
      console.log('Duttyfy: consultando status GET')

      const res = await fetch(statusUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      const contentType = res.headers.get('content-type')
      let responseData: Record<string, unknown>
      if (contentType && contentType.includes('application/json')) {
        responseData = await res.json()
      } else {
        const text = await res.text()
        responseData = { error: text }
      }

      if (!res.ok) {
        return new Response(
          JSON.stringify(responseData),
          { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const out = {
        status: responseData.status || 'PENDING',
        paidAt: responseData.paidAt,
      }
      return new Response(JSON.stringify(out), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({ error: 'Use POST com { data: { amount, customer, item } } para criar PIX ou GET com transactionId para status.' }),
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
