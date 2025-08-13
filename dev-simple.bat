@echo off
REM PeluPrice Development Helper Script for Windows (Simplified)
setlocal

REM Project directories
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%"
set "BACKEND_DIR=%PROJECT_ROOT%backend"
set "FRONTEND_DIR=%PROJECT_ROOT%frontend"

if "%1"=="" goto show_help
if "%1"=="help" goto show_help
if "%1"=="setup" goto setup
if "%1"=="start" goto start_dev
if "%1"=="init-db" goto init_db
if "%1"=="test" goto run_tests
goto show_help

:setup
echo [INFO] Setting up PeluPrice development environment...

REM Check prerequisites
where uv >nul 2>&1
if errorlevel 1 (
    echo [ERROR] uv is not installed. Please install it first:
    echo powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
    exit /b 1
)

where docker >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

REM Setup backend
echo [INFO] Setting up backend dependencies...
cd /d "%BACKEND_DIR%"
uv sync
if errorlevel 1 (
    echo [ERROR] Backend setup failed
    exit /b 1
)
cd /d "%PROJECT_ROOT%"

REM Setup frontend
echo [INFO] Setting up frontend dependencies...
cd /d "%FRONTEND_DIR%"
npm install
if errorlevel 1 (
    echo [ERROR] Frontend setup failed
    exit /b 1
)
cd /d "%PROJECT_ROOT%"

REM Setup environment
if not exist .env (
    echo [INFO] Creating .env file from example...
    if exist .env.example (
        copy .env.example .env >nul
    ) else (
        echo [WARNING] No .env.example found
    )
)

echo [SUCCESS] Development environment setup complete!
echo [INFO] Next steps:
echo 1. Configure your .env file
echo 2. Run 'docker-compose up -d' to start services
echo 3. Run 'dev-simple.bat start' to start development servers
goto end

:start_dev
echo [INFO] Starting development environment...

REM Check if required dependencies are installed
echo [INFO] Checking Python environment...
where uv >nul 2>&1
if errorlevel 1 (
    echo [ERROR] uv is not installed. Please install it first: powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
    exit /b 1
)

REM Start services with proper environment
if "%2"=="docker" (
    echo [INFO] Starting with Docker Compose...
    docker-compose up --build
) else (
    echo [INFO] Starting development servers...
    
    REM Start backend
    echo [INFO] Starting backend server...
    cd /d "%BACKEND_DIR%"
    
    REM Ensure dependencies are synced
    echo [INFO] Syncing dependencies...
    uv sync
    if errorlevel 1 (
        echo [ERROR] Failed to sync dependencies
        exit /b 1
    )
    
    REM Start backend with uv run (in background)
    echo [INFO] Starting uvicorn server...
    start "PeluPrice Backend" cmd /c "uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload & pause"
    
    REM Start frontend (in background)
    echo [INFO] Starting frontend server...
    cd /d "%FRONTEND_DIR%"
    start "PeluPrice Frontend" cmd /c "npm run dev & pause"
    
    REM Wait and show status
    timeout /t 3 /nobreak >nul
    echo [SUCCESS] Backend running at: http://localhost:8000
    echo [SUCCESS] Frontend running at: http://localhost:3000
    echo [INFO] Press Ctrl+C to stop this script (servers will continue running in separate windows)
    echo [INFO] To stop servers, close the backend and frontend windows manually
    
    REM Keep script running until user stops it
    pause
)
goto end

:init_db
echo [INFO] Initializing database...
cd /d "%BACKEND_DIR%"
uv run ../scripts/init_db.py
if errorlevel 1 (
    echo [ERROR] Database initialization failed
    exit /b 1
)
cd /d "%PROJECT_ROOT%"
echo [SUCCESS] Database initialized!
goto end

:run_tests
echo [INFO] Running tests...
cd /d "%BACKEND_DIR%"
uv run pytest
if errorlevel 1 (
    echo [ERROR] Tests failed
    exit /b 1
)
cd /d "%PROJECT_ROOT%"
echo [SUCCESS] Tests completed!
goto end

:show_help
echo PeluPrice Development Helper for Windows (Simplified)
echo.
echo Usage: dev-simple.bat ^<command^>
echo.
echo Commands:
echo   setup     - Setup development environment
echo   start     - Start development servers
echo   init-db   - Initialize database
echo   test      - Run tests
echo   help      - Show this help message
echo.
echo Examples:
echo   dev-simple.bat setup
echo   dev-simple.bat start
echo   dev-simple.bat start docker
goto end

:end
endlocal
