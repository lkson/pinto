/**
 * Integração com API xTracky - Envio de eventos de venda (waiting_payment / paid)
 * Endpoint: https://api.xtracky.com/api/integrations/api
 */
(function() {
  'use strict';

  var XTRACKY_TOKEN = '4c797a92-3bd1-49cf-a253-deec613640a0';
  var XTRACKY_API_URL = 'https://api.xtracky.com/api/integrations/api';

  /**
   * Obtém utm_source da URL ou do localStorage (xTracky armazena em XTRACKY_LEAD_ID_{token})
   * A API pede o valor da utm_source que estiver na URL - tentamos URL primeiro, depois fallback
   */
  function getUtmSource() {
    try {
      var params = new URLSearchParams(window.location.search);
      var utm = params.get('utm_source');
      if (utm && utm.length > 0) return utm;
      // Fallback: leadId do xTracky pode conter referência (o script usa XTRACKY_LEAD_ID_{token})
      var leadId = localStorage.getItem('XTRACKY_LEAD_ID_' + XTRACKY_TOKEN);
      if (leadId && leadId.length > 0) return leadId;
    } catch (e) {}
    return '';
  }

  /**
   * Envia evento de venda para a API xTracky
   * @param {string} orderId - Identificador da venda (ex: transactionId do PIX)
   * @param {number} amountCentavos - Valor em centavos
   * @param {string} status - 'waiting_payment' ou 'paid'
   */
  window.xtrackySendSale = function(orderId, amountCentavos, status) {
    if (!orderId || amountCentavos == null || !status) {
      console.warn('[xTracky] Dados incompletos para envio:', { orderId: orderId, amount: amountCentavos, status: status });
      return;
    }
    var utmSource = getUtmSource();
    var payload = {
      orderId: String(orderId),
      amount: Math.round(Number(amountCentavos)),
      status: status,
      utm_source: utmSource || '',
      token: XTRACKY_TOKEN
    };
    fetch(XTRACKY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      keepalive: true
    }).then(function(res) {
      if (res.ok) {
        console.log('[xTracky] Evento enviado:', status, orderId);
      } else {
        console.warn('[xTracky] Resposta não OK:', res.status, res.statusText);
      }
    }).catch(function(err) {
      console.warn('[xTracky] Erro ao enviar:', err);
    });
  };
})();
