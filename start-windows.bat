@echo off
REM PeluPrice Windows Quick Start Script
REM This batch file helps users get started if PowerShell execution policy blocks scripts

echo ===============================================
echo  PeluPrice Windows Development Setup
echo ===============================================
echo.

echo This script will help you set up PeluPrice for development on Windows.
echo.

REM Check if PowerShell scripts can run
echo [1/3] Checking PowerShell execution policy...
powershell -Command "Get-ExecutionPolicy" > temp_policy.txt
set /p POLICY=<temp_policy.txt
del temp_policy.txt

if /i "%POLICY%"=="Restricted" (
    echo [WARNING] PowerShell execution policy is Restricted.
    echo [INFO] This prevents running our PowerShell development scripts.
    echo.
    echo To fix this, run the following command in PowerShell as Administrator:
    echo   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
    echo.
    echo Alternatively, you can use the batch script: dev.bat
    echo.
    pause
    goto :check_prereqs
) else (
    echo [OK] PowerShell execution policy allows scripts: %POLICY%
)

:check_prereqs
echo.
echo [2/3] Checking prerequisites...

REM Check UV
where uv >nul 2>&1
if errorlevel 1 (
    echo [MISSING] UV package manager not found
    echo [ACTION] Installing UV...
    powershell -Command "irm https://astral.sh/uv/install.ps1 | iex"
    if errorlevel 1 (
        echo [ERROR] Failed to install UV. Please install manually.
        echo Visit: https://docs.astral.sh/uv/getting-started/installation/
        pause
        exit /b 1
    )
    echo [OK] UV installed successfully
) else (
    echo [OK] UV package manager found
)

REM Check Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo [MISSING] Node.js not found
    echo [ACTION] Please install Node.js 18+ from: https://nodejs.org
    start https://nodejs.org
    pause
) else (
    echo [OK] Node.js found
)

REM Check Docker
where docker >nul 2>&1
if errorlevel 1 (
    echo [MISSING] Docker not found
    echo [ACTION] Please install Docker Desktop from: https://docker.com/products/docker-desktop/
    start https://www.docker.com/products/docker-desktop/
    pause
) else (
    echo [OK] Docker found
)

:setup
echo.
echo [3/3] Setting up development environment...
echo.
echo Choose your preferred development script:
echo   1. PowerShell script (dev.ps1) - Recommended, better process management
echo   2. Batch script (dev.bat) - Fallback, opens separate windows
echo   3. Manual setup
echo.
choice /c 123 /m "Select option (1-3): "

if errorlevel 3 goto manual_setup
if errorlevel 2 goto batch_setup
if errorlevel 1 goto powershell_setup

:powershell_setup
echo.
echo Using PowerShell script...
powershell -ExecutionPolicy Bypass -File ".\setup-windows.ps1"
echo.
echo To start development:
echo   .\dev.ps1 setup
echo   .\dev.ps1 start
pause
exit /b 0

:batch_setup
echo.
echo Using Batch script...
call dev.bat setup
echo.
echo To start development:
echo   dev.bat start
pause
exit /b 0

:manual_setup
echo.
echo Manual setup instructions:
echo.
echo 1. Setup environment:
echo    copy .env.example .env
echo    REM Edit .env with your configuration
echo.
echo 2. Setup backend:
echo    cd backend
echo    uv sync
echo    cd ..
echo.
echo 3. Setup frontend:
echo    cd frontend
echo    npm install
echo    cd ..
echo.
echo 4. Start services:
echo    docker-compose up -d
echo.
echo 5. Start development servers:
echo    REM Backend: cd backend ^&^& uv run uvicorn app.main:app --reload
echo    REM Frontend: cd frontend ^&^& npm run dev
echo.
pause
exit /b 0
