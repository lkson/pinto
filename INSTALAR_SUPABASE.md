# Instalar Supabase CLI para Deploy

## Opção 1: Instalar Node.js e Supabase CLI (Recomendado)

### Passo 1: Instalar Node.js
1. Baixe o Node.js em: https://nodejs.org/
2. Instale a versão LTS (recomendada)
3. Reinicie o terminal após a instalação

### Passo 2: Instalar Supabase CLI
Abra o PowerShell como Administrador e execute:
```powershell
npm install -g supabase
```

### Passo 3: Verificar instalação
```powershell
supabase --version
```

### Passo 4: Fazer login no Supabase
```powershell
supabase login
```

### Passo 5: Linkar o projeto
```powershell
cd e:\cacaushow\pascoa
supabase link --project-ref xudfilvyvydckranlipn
```

### Passo 6: Fazer deploy da função
```powershell
supabase functions deploy pix-proxy
```

## Opção 2: Deploy Manual via Dashboard (Mais Rápido)

Se não quiser instalar o CLI, você pode fazer o deploy manualmente:

1. Acesse: https://supabase.com/dashboard/project/xudfilvyvydckranlipn/functions
2. Clique em "Create Function"
3. Nome: `pix-proxy`
4. Cole o código do arquivo `supabase-edge-function-pix-proxy.ts`
5. Clique em "Deploy"

## Opção 3: Usar Deno Deploy (Alternativa)

Se você tiver Deno instalado:
```powershell
deno install --allow-net --allow-env supabase
```
