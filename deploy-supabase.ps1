# Script para fazer deploy da Edge Function no Supabase
# Requer: Node.js e Supabase CLI instalados

Write-Host "=== Deploy da Edge Function pix-proxy ===" -ForegroundColor Cyan

# Verificar se Supabase CLI está instalado
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseInstalled) {
    Write-Host "Supabase CLI não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para instalar:" -ForegroundColor Yellow
    Write-Host "1. Instale Node.js: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "2. Execute: npm install -g supabase" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ou faça o deploy manualmente:" -ForegroundColor Yellow
    Write-Host "1. Acesse: https://supabase.com/dashboard/project/xudfilvyvydckranlipn/functions" -ForegroundColor Cyan
    Write-Host "2. Crie uma função chamada 'pix-proxy'" -ForegroundColor Cyan
    Write-Host "3. Cole o código do arquivo supabase-edge-function-pix-proxy.ts" -ForegroundColor Cyan
    exit 1
}

Write-Host "Supabase CLI encontrado!" -ForegroundColor Green

# Verificar se está logado
Write-Host "Verificando login..." -ForegroundColor Cyan
$loginCheck = supabase projects list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Você precisa fazer login primeiro!" -ForegroundColor Yellow
    Write-Host "Execute: supabase login" -ForegroundColor Yellow
    exit 1
}

# Verificar se o projeto está linkado
Write-Host "Verificando projeto linkado..." -ForegroundColor Cyan
if (-not (Test-Path "supabase\.temp\project-ref")) {
    Write-Host "Projeto não está linkado. Linkando..." -ForegroundColor Yellow
    supabase link --project-ref xudfilvyvydckranlipn
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erro ao linkar projeto!" -ForegroundColor Red
        exit 1
    }
}

# Fazer deploy da função
Write-Host "Fazendo deploy da função pix-proxy..." -ForegroundColor Cyan
supabase functions deploy pix-proxy --no-verify-jwt

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host "Função disponível em: https://xudfilvyvydckranlipn.supabase.co/functions/v1/pix-proxy" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Erro ao fazer deploy!" -ForegroundColor Red
    Write-Host "Verifique os logs acima para mais detalhes." -ForegroundColor Yellow
}
