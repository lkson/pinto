# Servidor HTTP simples em PowerShell
# Não requer Node.js, Python ou outras dependências

$port = 8080
$url = "http://localhost:$port/"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Servidor HTTP Local - Cacau Show" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Servidor iniciado em: $url" -ForegroundColor Green
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Yellow
Write-Host ""

# Abre o navegador automaticamente
Start-Process $url

# Cria um listener HTTP
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
$listener.Start()

Write-Host "Aguardando requisições..." -ForegroundColor Green
Write-Host ""

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $localPath = $request.Url.LocalPath
        if ($localPath -eq "/") {
            $localPath = "/index.html"
        }
        
        $filePath = Join-Path $PSScriptRoot $localPath.TrimStart('/')
        
        if (Test-Path $filePath -PathType Leaf) {
            $content = [System.IO.File]::ReadAllBytes($filePath)
            $extension = [System.IO.Path]::GetExtension($filePath)
            
            # Define o Content-Type baseado na extensão
            $contentType = switch ($extension) {
                ".html" { "text/html; charset=utf-8" }
                ".css" { "text/css; charset=utf-8" }
                ".js" { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png" { "image/png" }
                ".jpg" { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".gif" { "image/gif" }
                ".svg" { "image/svg+xml" }
                ".ico" { "image/x-icon" }
                ".woff" { "font/woff" }
                ".woff2" { "font/woff2" }
                ".ttf" { "font/ttf" }
                ".eot" { "application/vnd.ms-fontobject" }
                default { "application/octet-stream" }
            }
            
            $response.ContentType = $contentType
            $response.ContentLength64 = $content.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 - Arquivo não encontrado")
            $response.ContentLength64 = $notFound.Length
            $response.OutputStream.Write($notFound, 0, $notFound.Length)
        }
        
        $response.Close()
    }
} finally {
    $listener.Stop()
    Write-Host ""
    Write-Host "Servidor parado." -ForegroundColor Yellow
}
