# PeluPrice Development Helper Script for Windows (PowerShell)
param(
    [Parameter(Mandatory=$false, Position=0)]
    [string]$Command = "help",
    
    [Parameter(Mandatory=$false)]
    [switch]$Docker
)

# Project directories
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = $ScriptDir
$BackendDir = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"

# Color functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Test-CommandExists {
    param([string]$CommandName)
    $null = Get-Command $CommandName -ErrorAction SilentlyContinue
    return $?
}

function Setup-Dev {
    Write-Info "Setting up PeluPrice development environment..."
    
    # Check prerequisites
    if (-not (Test-CommandExists "uv")) {
        Write-Error "uv is not installed. Please install it first:"
        Write-Host "Run: irm https://astral.sh/uv/install.ps1 | iex" -ForegroundColor Cyan
        exit 1
    }
    
    if (-not (Test-CommandExists "docker")) {
        Write-Error "Docker is not installed. Please install Docker Desktop first."
        exit 1
    }
    
    if (-not (Test-CommandExists "node")) {
        Write-Error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    }
    
    # Setup backend
    Write-Info "Setting up backend dependencies..."
    Push-Location $BackendDir
    try {
        uv sync
        if ($LASTEXITCODE -ne 0) {
            throw "Backend setup failed"
        }
    }
    finally {
        Pop-Location
    }
    
    # Setup frontend
    Write-Info "Setting up frontend dependencies..."
    Push-Location $FrontendDir
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            throw "Frontend setup failed"
        }
    }
    finally {
        Pop-Location
    }
    
    # Setup environment
    $envPath = Join-Path $ProjectRoot ".env"
    $envExamplePath = Join-Path $ProjectRoot ".env.example"
    
    if (-not (Test-Path $envPath)) {
        Write-Info "Creating .env file from example..."
        if (Test-Path $envExamplePath) {
            Copy-Item $envExamplePath $envPath
        } else {
            Write-Warning "No .env.example found"
        }
    }
    
    Write-Success "Development environment setup complete!"
    Write-Info "Next steps:"
    Write-Host "1. Configure your .env file" -ForegroundColor White
    Write-Host "2. Run 'docker-compose up -d' to start services" -ForegroundColor White
    Write-Host "3. Run 'dev.ps1 start' to start development servers" -ForegroundColor White
}

function Start-Dev {
    Write-Info "Starting development environment..."
    
    # Check if required dependencies are installed
    Write-Info "Checking Python environment..."
    if (-not (Test-CommandExists "uv")) {
        Write-Error "uv is not installed. Please install it first: irm https://astral.sh/uv/install.ps1 | iex"
        exit 1
    }
    
    # Start services with proper environment
    if ($Docker) {
        Write-Info "Starting with Docker Compose..."
        docker-compose up --build
    } else {
        Write-Info "Starting development servers..."
        
        # Start backend
        Write-Info "Starting backend server..."
        Push-Location $BackendDir
        
        try {
            # Ensure dependencies are synced
            Write-Info "Syncing dependencies..."
            uv sync
            if ($LASTEXITCODE -ne 0) {
                throw "Failed to sync dependencies"
            }
            
            # Start backend with uv run (in background)
            Write-Info "Starting uvicorn server..."
            $backendJob = Start-Job -ScriptBlock {
                Set-Location $using:BackendDir
                uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
            } -Name "PeluPrice-Backend"
            
        }
        finally {
            Pop-Location
        }
        
        # Start frontend (in background)
        Write-Info "Starting frontend server..."
        Push-Location $FrontendDir
        
        try {
            $frontendJob = Start-Job -ScriptBlock {
                Set-Location $using:FrontendDir
                npm run dev
            } -Name "PeluPrice-Frontend"
        }
        finally {
            Pop-Location
        }
        
        # Wait and show status
        Start-Sleep -Seconds 3
        Write-Success "✅ Backend running at: http://localhost:8000"
        Write-Success "✅ Frontend running at: http://localhost:3000"
        Write-Info "Press Ctrl+C to stop all servers"
        
        # Monitor jobs and wait for interrupt
        try {
            while ($true) {
                # Check if jobs are still running
                if ($backendJob.State -eq "Failed") {
                    Write-Error "Backend server failed!"
                    Receive-Job $backendJob
                    break
                }
                
                if ($frontendJob.State -eq "Failed") {
                    Write-Error "Frontend server failed!"
                    Receive-Job $frontendJob
                    break
                }
                
                Start-Sleep -Seconds 1
            }
        }
        finally {
            # Cleanup jobs
            Write-Info "Stopping servers..."
            Stop-Job $backendJob -ErrorAction SilentlyContinue
            Stop-Job $frontendJob -ErrorAction SilentlyContinue
            Remove-Job $backendJob -ErrorAction SilentlyContinue
            Remove-Job $frontendJob -ErrorAction SilentlyContinue
            Write-Info "Servers stopped"
        }
    }
}

function Initialize-Database {
    Write-Info "Initializing database..."
    Push-Location $BackendDir
    try {
        uv run ..\scripts\init_db.py
        if ($LASTEXITCODE -ne 0) {
            throw "Database initialization failed"
        }
    }
    finally {
        Pop-Location
    }
    Write-Success "Database initialized!"
}

function Run-Tests {
    Write-Info "Running tests..."
    Push-Location $BackendDir
    try {
        uv run pytest
        if ($LASTEXITCODE -ne 0) {
            throw "Tests failed"
        }
    }
    finally {
        Pop-Location
    }
    Write-Success "Tests completed!"
}

function Show-Help {
    Write-Host "PeluPrice Development Helper for Windows (PowerShell)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\dev.ps1 [command] [options]" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  setup     - Setup development environment" -ForegroundColor White
    Write-Host "  start     - Start development servers" -ForegroundColor White
    Write-Host "  init-db   - Initialize database" -ForegroundColor White
    Write-Host "  test      - Run tests" -ForegroundColor White
    Write-Host "  help      - Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -Docker   - Use Docker Compose (only with 'start' command)" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\dev.ps1 setup" -ForegroundColor Gray
    Write-Host "  .\dev.ps1 start" -ForegroundColor Gray
    Write-Host "  .\dev.ps1 start -Docker" -ForegroundColor Gray
}

# Main script logic
switch ($Command.ToLower()) {
    "setup" {
        Setup-Dev
    }
    "start" {
        Start-Dev
    }
    "init-db" {
        Initialize-Database
    }
    "test" {
        Run-Tests
    }
    default {
        Show-Help
    }
}
