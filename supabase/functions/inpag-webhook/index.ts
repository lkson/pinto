// Edge Function para receber postbacks da InPago (webhook)
// Configure na InPago a URL: https://SEU_PROJETO.supabase.co/functions/v1/inpag-webhook
// No Supabase: desative "Verify JWT" para esta função (InPago não envia JWT)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método não permitido. Use POST.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const rawBody = await req.text()
    let body: Record<string, unknown> | null = null
    try {
      if (rawBody?.trim()) body = JSON.parse(rawBody)
    } catch (_) {}

    if (!body || body.type !== 'transaction' || !body.data) {
      console.log('inpag-webhook: body inválido ou não é postback de transação')
      return new Response(JSON.stringify({ received: false }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = body.data as Record<string, unknown>
    const id = data.id ?? data.secureId ?? body.objectId
    const status = data.status
    const paidAt = data.paidAt
    const externalRef = data.externalRef

    console.log('inpag-webhook: transação', id, 'status:', status, 'paidAt:', paidAt, 'externalRef:', externalRef)

    // Aqui você pode: salvar em tabela Supabase, notificar outro serviço, etc.
    // Ex.: await supabase.from('pix_events').insert({ object_id: id, status, paid_at: paidAt, payload: data })

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('inpag-webhook erro:', error)
    return new Response(JSON.stringify({ received: false, error: (error as Error).message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
