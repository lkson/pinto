# Solução para Problemas de Domínio na Vercel

## Problema: Domínio conectado mas site não carrega

### Checklist de Verificação

#### 1. Verificar DNS na Vercel
- Acesse: https://vercel.com/dashboard
- Vá em seu projeto > **Settings** > **Domains**
- Verifique se o domínio aparece como **Valid** (verde)
- Se aparecer "Invalid Configuration", verifique os registros DNS abaixo

#### 2. Verificar Registros DNS

A Vercel precisa de registros DNS específicos. Verifique no seu provedor de domínio:

**Para domínio raiz (exemplo.com):**
```
Tipo: A
Nome: @
Valor: 76.76.21.21
TTL: 3600 (ou automático)
```

**Para subdomínio www (www.exemplo.com):**
```
Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
TTL: 3600 (ou automático)
```

**OU usar apenas CNAME (recomendado):**
```
Tipo: CNAME
Nome: @
Valor: cname.vercel-dns.com
TTL: 3600 (ou automático)
```

#### 3. Verificar Propagação DNS

Use ferramentas online para verificar se o DNS propagou:
- https://dnschecker.org/
- https://www.whatsmydns.net/
- https://mxtoolbox.com/DNSLookup.aspx

Digite seu domínio e verifique se os registros estão corretos.

#### 4. Verificar SSL/HTTPS

- A Vercel configura SSL automaticamente
- Pode levar até 24 horas após a configuração do DNS
- Verifique se o certificado SSL está ativo no dashboard da Vercel

#### 5. Verificar Cache do Navegador

- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Tente em modo anônimo/privado
- Tente em outro navegador
- Tente em outro dispositivo/rede

#### 6. Verificar Redirecionamentos

- Verifique se há redirecionamentos configurados no seu provedor de domínio
- Verifique se há redirecionamentos no código (verifique `index.html`)

#### 7. Verificar Configuração do Projeto

O arquivo `vercel.json` foi criado com configurações básicas. Se necessário, ajuste:

```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/$1"
    }
  ]
}
```

#### 8. Verificar Logs da Vercel

- Acesse: https://vercel.com/dashboard
- Vá em seu projeto > **Deployments**
- Clique no deployment mais recente
- Verifique os **Logs** para erros

#### 9. Problemas Comuns

**Erro: "This site can't be reached"**
- DNS ainda não propagou (aguarde até 48 horas)
- Registros DNS incorretos
- Firewall bloqueando

**Erro: "SSL Certificate Error"**
- Certificado ainda não foi emitido (aguarde até 24 horas)
- DNS não propagou completamente

**Erro: "404 Not Found"**
- Verifique se o arquivo `index.html` existe na raiz
- Verifique configurações de build na Vercel

**Site carrega mas mostra página em branco**
- Verifique console do navegador (F12) para erros JavaScript
- Verifique se todos os arquivos CSS/JS estão sendo carregados
- Verifique CORS se houver chamadas de API

#### 10. Testar Domínio

Teste diretamente:
```bash
# Verificar DNS
nslookup seu-dominio.com

# Verificar HTTP
curl -I http://seu-dominio.com

# Verificar HTTPS
curl -I https://seu-dominio.com
```

#### 11. Forçar Novo Deploy

Às vezes um novo deploy resolve:
- Faça um commit vazio: `git commit --allow-empty -m "Force redeploy"`
- Push: `git push origin main`
- Aguarde o deploy na Vercel

#### 12. Contatar Suporte Vercel

Se nada funcionar:
- Acesse: https://vercel.com/support
- Forneça:
  - URL do domínio
  - Screenshot do dashboard mostrando domínio como "Valid"
  - Resultado de `nslookup` ou `dig`
  - Logs do deployment

## Configuração Recomendada

### Para Domínio Raiz (exemplo.com)

**Opção 1: Usar A Record (mais simples)**
```
Tipo: A
Nome: @
Valor: 76.76.21.21
```

**Opção 2: Usar CNAME (se seu provedor permitir)**
```
Tipo: CNAME
Nome: @
Valor: cname.vercel-dns.com
```

### Para Subdomínio www

```
Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
```

## Tempo de Propagação

- DNS: 15 minutos a 48 horas (geralmente 1-4 horas)
- SSL: Até 24 horas após DNS propagar
- Cache do navegador: Limpe manualmente

## Próximos Passos

1. Verifique os registros DNS no seu provedor
2. Aguarde propagação (use dnschecker.org para monitorar)
3. Verifique status na Vercel (deve ficar verde)
4. Teste em modo anônimo após propagação
5. Se ainda não funcionar, verifique logs e console do navegador
