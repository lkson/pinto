# Configuração do Supabase para Proxy de API PIX

Este documento explica como configurar o Supabase para fazer proxy das chamadas à API PIX e evitar erros de CORS.

## Passo 1: Criar Edge Function no Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto: `xudfilvyvydckranlipn`
3. Vá em **Edge Functions** no menu lateral
4. Clique em **Create Function**
5. Nome da função: `pix-proxy`
6. Copie o conteúdo do arquivo `supabase-edge-function-pix-proxy.ts` para o editor
7. Clique em **Deploy**

## Passo 2: Verificar a Função

Após o deploy, a função estará disponível em:
```
https://xudfilvyvydckranlipn.supabase.co/functions/v1/pix-proxy
```

## Passo 3: Testar

As funções JavaScript já estão configuradas nos arquivos:
- `checkout.html` - função `gerarPIX()`
- `pagamento-pix.html` - função `verificarStatusPIX()`

Ambas usam a função `chamarAPIViaSupabase()` que faz as requisições através do Supabase.

## Estrutura da Requisição

A função `chamarAPIViaSupabase()` envia:
```json
{
  "endpoint": "https://app.duttyfy.com.br/api-pix/...",
  "method": "POST" ou "GET",
  "data": { ... } // opcional, apenas para POST
}
```

A Edge Function do Supabase então faz a requisição real para a API Duttyfy e retorna a resposta com os cabeçalhos CORS apropriados.

## Notas

- A Edge Function adiciona automaticamente os cabeçalhos CORS necessários
- Todas as requisições passam pelo Supabase, evitando problemas de CORS no navegador
- A API Key do Supabase está configurada nas funções JavaScript
