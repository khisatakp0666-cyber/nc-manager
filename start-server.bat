@echo off
cd /d "%~dp0"

echo [INFO] Node.js�v���Z�X���m�F��...

:: Node.js���g���Ă���|�[�g�i��F3000�j���������
for /f "tokens=5" %%a in ('netstat -ano ^| find ":3000" ^| find "LISTENING"') do (
    echo [INFO] �|�[�g3000���g�p���Ă���v���Z�X���I�����܂��iPID: %%a�j
    taskkill /PID %%a /F
)

echo [INFO] Node.js�T�[�o�[���N�����܂�...
node server.js

pause