@echo off
REM PeluPrice Development Helper Script for Windows
setlocal enabledelayedexpansion

REM Project directories
set "SCR    # Wait and show status
    timeout /t 3 /nobreak >nul
    call :log_success "Backend running at: http://localhost:8000"
    call :log_success "Frontend running at: http://localhost:3000"
    call :log_info "Press Ctrl+C to stop this script (servers will continue running in separate windows)"
    call :log_info "To stop servers, close the backend and frontend windows manually"R=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%"
set "BACKEND_DIR=%PROJECT_ROOT%backend"
set "FRONTEND_DIR=%PROJECT_ROOT%frontend"

REM Color codes for Windows (using PowerShell for colors)
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "BLUE=[34m"
set "NC=[0m"

REM Functions equivalent
goto main

:log_info
echo [34m[INFO][0m %~1
goto :eof

:log_success
echo [32m[SUCCESS][0m %~1
goto :eof

:log_warning
echo [33m[WARNING][0m %~1
goto :eof

:log_error
echo [31m[ERROR][0m %~1
goto :eof

:command_exists
where %1 >nul 2>&1
goto :eof

:setup_dev
call :log_info "Setting up PeluPrice development environment..."

REM Check prerequisites
call :command_exists uv
if errorlevel 1 (
    call :log_error "uv is not installed. Please install it first:"
    echo powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
    exit /b 1
)

call :command_exists docker
if errorlevel 1 (
    call :log_error "Docker is not installed. Please install Docker Desktop first."
    exit /b 1
)

call :command_exists node
if errorlevel 1 (
    call :log_error "Node.js is not installed. Please install Node.js 18+ first."
    exit /b 1
)

REM Setup backend
call :log_info "Setting up backend dependencies..."
cd /d "%BACKEND_DIR%"
uv sync
cd /d "%PROJECT_ROOT%"

REM Setup frontend
call :log_info "Setting up frontend dependencies..."
cd /d "%FRONTEND_DIR%"
npm install
cd /d "%PROJECT_ROOT%"

REM Setup environment
if not exist .env (
    call :log_info "Creating .env file from example..."
    if exist .env.example (
        copy .env.example .env >nul
    ) else (
        call :log_warning "No .env.example found"
    )
)

call :log_success "Development environment setup complete!"
call :log_info "Next steps:"
echo 1. Configure your .env file
echo 2. Run 'docker-compose up -d' to start services
echo 3. Run 'dev.bat start' to start development servers
goto :eof

:start_dev
call :log_info "Starting development environment..."

REM Check if required dependencies are installed
call :log_info "Checking Python environment..."
call :command_exists uv
if errorlevel 1 (
    call :log_error "uv is not installed. Please install it first: powershell -c \"irm https://astral.sh/uv/install.ps1 | iex\""
    exit /b 1
)

REM Start services with proper environment
if "%~2"=="docker" (
    call :log_info "Starting with Docker Compose..."
    docker-compose up --build
) else (
    call :log_info "Starting development servers..."
    
    REM Start backend
    call :log_info "Starting backend server..."
    cd /d "%BACKEND_DIR%"
    
    REM Ensure dependencies are synced
    call :log_info "Syncing dependencies..."
    uv sync
    
    REM Start backend with uv run (in background)
    call :log_info "Starting uvicorn server..."
    start "PeluPrice Backend" cmd /c "uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
    
    REM Start frontend (in background)
    call :log_info "Starting frontend server..."
    cd /d "%FRONTEND_DIR%"
    start "PeluPrice Frontend" cmd /c "npm run dev"
    
    REM Wait and show status
    timeout /t 3 /nobreak >nul
    call :log_success "✅ Backend running at: http://localhost:8000"
    call :log_success "✅ Frontend running at: http://localhost:3000"
    call :log_info "Press Ctrl+C to stop this script (servers will continue running in separate windows)"
    call :log_info "To stop servers, close the backend and frontend windows manually"
    
    REM Keep script running until user stops it
    pause
)
goto :eof

:init_db
call :log_info "Initializing database..."
cd /d "%BACKEND_DIR%"
uv run ..\scripts\init_db.py
cd /d "%PROJECT_ROOT%"
call :log_success "Database initialized!"
goto :eof

:test
call :log_info "Running tests..."
cd /d "%BACKEND_DIR%"
uv run pytest
cd /d "%PROJECT_ROOT%"
call :log_success "Tests completed!"
goto :eof

:show_help
echo PeluPrice Development Helper for Windows
echo.
echo Usage: dev.bat ^<command^>
echo.
echo Commands:
echo   setup     - Setup development environment
echo   start     - Start development servers
echo   init-db   - Initialize database
echo   test      - Run tests
echo   help      - Show this help message
echo.
echo Examples:
echo   dev.bat setup
echo   dev.bat start
echo   dev.bat start docker
goto :eof

:main
REM Main script logic
set "command=%~1"
if "%command%"=="" set "command=help"

if "%command%"=="setup" (
    call :setup_dev
) else if "%command%"=="start" (
    call :start_dev %*
) else if "%command%"=="init-db" (
    call :init_db
) else if "%command%"=="test" (
    call :test
) else (
    call :show_help
)

endlocal
