# Script para fazer push do código para o GitHub
# Execute este script no PowerShell

$repoUrl = "https://github.com/lkson/pinto.git"
# Token deve ser fornecido via variável de ambiente ou entrada do usuário
$token = $env:GITHUB_TOKEN
if (-not $token) {
    Write-Host "Por favor, defina a variável de ambiente GITHUB_TOKEN ou forneça o token quando solicitado" -ForegroundColor Yellow
    $token = Read-Host "Digite seu token GitHub"
}

# Verificar se git está instalado
$gitPath = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitPath) {
    Write-Host "Git não encontrado. Verificando locais comuns..." -ForegroundColor Yellow
    
    # Tentar locais comuns de instalação do Git
    $possiblePaths = @(
        "C:\Program Files\Git\cmd\git.exe",
        "C:\Program Files (x86)\Git\cmd\git.exe",
        "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
    )
    
    $found = $false
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $env:PATH += ";$(Split-Path $path)"
            Write-Host "Git encontrado em: $path" -ForegroundColor Green
            $found = $true
            break
        }
    }
    
    if (-not $found) {
        Write-Host "Git não encontrado. Por favor, instale o Git primeiro:" -ForegroundColor Red
        Write-Host "https://git-scm.com/download/win" -ForegroundColor Cyan
        exit 1
    }
}

Write-Host "Inicializando repositório Git..." -ForegroundColor Cyan

# Inicializar repositório se não existir
if (-not (Test-Path .git)) {
    git init
    Write-Host "Repositório inicializado." -ForegroundColor Green
}

# Configurar remote
Write-Host "Configurando remote..." -ForegroundColor Cyan
$remoteUrl = "https://$token@github.com/lkson/pinto.git"
git remote remove origin 2>$null
git remote add origin $remoteUrl

# Adicionar todos os arquivos
Write-Host "Adicionando arquivos..." -ForegroundColor Cyan
git add .

# Fazer commit
Write-Host "Fazendo commit..." -ForegroundColor Cyan
$commitMessage = "Initial commit - Cacau Show Páscoa project"
git commit -m $commitMessage

# Fazer push
Write-Host "Fazendo push para o GitHub..." -ForegroundColor Cyan
git push -u origin main

# Se main não existir, tentar master
if ($LASTEXITCODE -ne 0) {
    Write-Host "Tentando branch master..." -ForegroundColor Yellow
    git branch -M master
    git push -u origin master
}

Write-Host "Push concluído com sucesso!" -ForegroundColor Green
