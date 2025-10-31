@echo off
setlocal

REM === �ݒ� ===
set PORT=8085
set JAR_PATH=record-api\build\libs\record-api-0.0.1-SNAPSHOT.jar
set JAVA_EXEC="C:\Program Files\Eclipse Adoptium\jdk-25.0.0.36-hotspot\bin\java.exe"
set LOG_FILE=server.log

REM === �|�[�g�g�p���� PID ���擾���ċ����I�� ===
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTENING') do (
    echo Port %PORT% is in use by PID %%a. Killing...
    taskkill /PID %%a /F >nul 2>&1
)

REM === Spring Boot �N���i�����{���O�t���j ===
echo Starting Record API...
echo Logging to %LOG_FILE%
echo.

%JAVA_EXEC% -jar %JAR_PATH% > %LOG_FILE% 2>&1

REM === �a�ʊm�F�y�[�W���u���E�U�ŊJ���i�N����j ===
start http://localhost:%PORT%/health

REM === �ē��\�� ===
echo Server started. Browser opened to: http://localhost:%PORT%/health
echo Log file: %LOG_FILE%
echo.

pause
endlocal