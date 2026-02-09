# Configuração da API PIX Duttyfy

## ⚠️ IMPORTANTE: Use sempre a URL encriptada

De acordo com a documentação da API Duttyfy, você **DEVE** usar sempre a URL encriptada gerada no painel, **NÃO** a chave bruta na URL.

## Como obter a URL encriptada

1. Acesse o painel Duttyfy
2. Vá em **Chaves API**
3. Clique em **Gerar URL encriptada**
4. Copie a URL completa gerada

## Configuração nos arquivos

### 1. checkout.html

Localize a linha com `DUTTYFY_PIX_URL_ENCRIPTADA` (aproximadamente linha 753) e substitua pela sua URL encriptada:

```javascript
var DUTTYFY_PIX_URL_ENCRIPTADA = 'https://app.duttyfy.com.br/api-pix/[SUA_URL_ENCRIPTADA_AQUI]';
```

### 2. pagamento-pix.html

Localize a linha com `DUTTYFY_PIX_URL_ENCRIPTADA` (aproximadamente linha 414) e substitua pela mesma URL encriptada:

```javascript
var DUTTYFY_PIX_URL_ENCRIPTADA = 'https://app.duttyfy.com.br/api-pix/[SUA_URL_ENCRIPTADA_AQUI]';
```

## Estrutura da requisição (conforme documentação)

### POST - Criar PIX

**Endpoint:** `{SUA_URL_ENCRIPTADA}` (sem adicionar `/api-pix/` ou chave bruta)

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "amount": 200,
  "description": "Pagamento via Pix",
  "customer": {
    "name": "Carlos Eduardo",
    "document": "25747510860",
    "email": "carlos.eduardo@gmail.com",
    "phone": "11987654321"
  },
  "item": {
    "title": "E-book Como Vender no Pix",
    "price": 200,
    "quantity": 1
  },
  "paymentMethod": "PIX",
  "utm": "utm_source=facebook&utm_medium=cpc"
}
```

**Resposta de sucesso (200):**
```json
{
  "pixCode": "00020126870014br.gov.bcb.pix...",
  "transactionId": "e674f6ae-d2ff-41e3-94b7-5b2bdc1d6276",
  "status": "PENDING"
}
```

### GET - Verificar status

**Endpoint:** `{SUA_URL_ENCRIPTADA}?transactionId={transactionId}`

## Validações implementadas

✅ Estrutura do body JSON conforme documentação
✅ Campos obrigatórios: amount, description, customer, item, paymentMethod
✅ Valores em centavos (amount e price)
✅ Tratamento de erros da API
✅ Validação de resposta JSON

## ⚠️ Evite duplicar cobrança

Cada chamada POST gera uma nova cobrança. O código já implementa controle para evitar duplicação através do localStorage.

## Próximos passos

1. Obter a URL encriptada no painel Duttyfy
2. Substituir `DUTTYFY_PIX_URL_ENCRIPTADA` nos dois arquivos
3. Testar a criação de PIX
4. Verificar se o status está sendo consultado corretamente
