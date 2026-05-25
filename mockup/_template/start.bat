@echo off
echo === mockup UI 起動中 ===

cd /d "%~dp0"

if not exist node_modules (
    echo 初回起動: 依存パッケージをインストールしています...
    npm install
)

echo ポートを自動検出して起動します（3000番から順に空きを探します）
node server.js

pause
