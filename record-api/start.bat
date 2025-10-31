@echo off
setlocal

REM === 設定 ===
set PORT=8085
set JAR_PATH=record-api\build\libs\record-api-0.0.1-SNAPSHOT.jar
set JAVA_EXEC="C:\Program Files\Eclipse Adoptium\jdk-25.0.0.36-hotspot\bin\java.exe"
set LOG_FILE=server.log

REM === ポート使用中の PID を取得して強制終了 ===
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTENING') do (
    echo Port %PORT% is in use by PID %%a. Killing...
    taskkill /PID %%a /F >nul 2>&1
)

REM === Spring Boot 起動（同期＋ログ付き） ===
echo Starting Record API...
echo Logging to %LOG_FILE%
echo.

%JAVA_EXEC% -jar %JAR_PATH% > %LOG_FILE% 2>&1

REM === 疎通確認ページをブラウザで開く（起動後） ===
start http://localhost:%PORT%/health

REM === 案内表示 ===
echo Server started. Browser opened to: http://localhost:%PORT%/health
echo Log file: %LOG_FILE%
echo.

pause
endlocal