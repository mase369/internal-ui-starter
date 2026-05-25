# scratch UI 初回セットアップスクリプト
# 実行方法: PowerShell で右クリック → PowerShell で実行

Write-Host "=== scratch UI セットアップ ===" -ForegroundColor Cyan

# Node.js の確認
Write-Host "`n[1/2] Node.js の確認..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Node.js が見つかりません。" -ForegroundColor Red
    Write-Host "IT が提供するインストーラーを実行してから、このスクリプトを再実行してください。" -ForegroundColor Red
    Read-Host "`nEnterキーで終了"
    exit 1
}
Write-Host "OK: Node.js $nodeVersion" -ForegroundColor Green

$npmVersion = npm --version 2>$null
Write-Host "OK: npm $npmVersion" -ForegroundColor Green

Write-Host "`n[2/2] セットアップ完了。" -ForegroundColor Green
Write-Host @"

scratch UI を起動するには:
  1. IT から受け取ったフォルダを任意の場所に展開する
  2. フォルダ内の data/ に CSV ファイルを配置する
  3. start.bat をダブルクリックする
  4. ブラウザで http://localhost:3000 が自動的に開く

"@ -ForegroundColor White

Read-Host "Enterキーで終了"
