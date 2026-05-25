Set-Location $PSScriptRoot

Write-Host "=== mockup UI 起動中 ===" -ForegroundColor Cyan

if (-not (Test-Path "node_modules")) {
    Write-Host "初回起動: 依存パッケージをインストールしています..." -ForegroundColor Yellow
    npm install
}

Write-Host "ポートを自動検出して起動します（3000番から順に空きを探します）" -ForegroundColor Green
node server.js
