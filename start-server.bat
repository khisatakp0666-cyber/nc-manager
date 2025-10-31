@echo off
cd /d "%~dp0"

echo [INFO] Node.jsプロセスを確認中...

:: Node.jsが使っているポート（例：3000）を強制解放
for /f "tokens=5" %%a in ('netstat -ano ^| find ":3000" ^| find "LISTENING"') do (
    echo [INFO] ポート3000を使用しているプロセスを終了します（PID: %%a）
    taskkill /PID %%a /F
)

echo [INFO] Node.jsサーバーを起動します...
node server.js

pause