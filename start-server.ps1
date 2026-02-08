# Script para iniciar servidor local
Write-Host "Tentando iniciar servidor local..." -ForegroundColor Cyan

# Verifica se Node.js está disponível
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "Node.js encontrado! Instalando dependências e iniciando servidor..." -ForegroundColor Green
    if (-not (Test-Path "node_modules")) {
        npm install
    }
    npm start
    exit
}

# Verifica se Python está disponível
if (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host "Python encontrado! Iniciando servidor..." -ForegroundColor Green
    python -m http.server 8080
    exit
}

# Verifica se Python3 está disponível
if (Get-Command python3 -ErrorAction SilentlyContinue) {
    Write-Host "Python3 encontrado! Iniciando servidor..." -ForegroundColor Green
    python3 -m http.server 8080
    exit
}

# Verifica se PHP está disponível
if (Get-Command php -ErrorAction SilentlyContinue) {
    Write-Host "PHP encontrado! Iniciando servidor..." -ForegroundColor Green
    php -S localhost:8080
    exit
}

# Se nenhum método foi encontrado
Write-Host "Nenhum servidor HTTP encontrado!" -ForegroundColor Red
Write-Host ""
Write-Host "Opções disponíveis:" -ForegroundColor Yellow
Write-Host "1. Instale Node.js: https://nodejs.org/"
Write-Host "2. Instale Python: https://www.python.org/"
Write-Host "3. Instale PHP: https://www.php.net/"
Write-Host "4. Use a extensão 'Live Server' no VS Code"
Write-Host "5. Abra index.html diretamente no navegador (algumas funcionalidades podem não funcionar)"
