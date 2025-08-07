# PeluPrice Windows Setup Script
# This script helps Windows users install prerequisites for PeluPrice development

param(
    [switch]$All,
    [switch]$UV,
    [switch]$Node,
    [switch]$Docker
)

function Write-Title {
    param([string]$Message)
    Write-Host ""
    Write-Host "=" * 50 -ForegroundColor Cyan
    Write-Host " $Message" -ForegroundColor Cyan
    Write-Host "=" * 50 -ForegroundColor Cyan
}

function Write-Step {
    param([string]$Message)
    Write-Host "→ $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Blue
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Install-UV {
    Write-Title "Installing UV Package Manager"
    
    if (Get-Command "uv" -ErrorAction SilentlyContinue) {
        Write-Info "UV is already installed"
        uv --version
        return
    }
    
    Write-Step "Downloading and installing UV..."
    try {
        Invoke-RestMethod https://astral.sh/uv/install.ps1 | Invoke-Expression
        Write-Step "UV installed successfully!"
        
        # Add to PATH for current session
        $uvPath = "$env:USERPROFILE\.cargo\bin"
        if ($env:PATH -notlike "*$uvPath*") {
            $env:PATH += ";$uvPath"
        }
        
        Write-Info "Restart your terminal to use uv globally, or run: refreshenv"
    }
    catch {
        Write-Warning "Failed to install UV. Please install manually from: https://docs.astral.sh/uv/getting-started/installation/"
    }
}

function Install-Node {
    Write-Title "Installing Node.js"
    
    if (Get-Command "node" -ErrorAction SilentlyContinue) {
        Write-Info "Node.js is already installed"
        $nodeVersion = node --version
        Write-Info "Version: $nodeVersion"
        
        $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
        if ($majorVersion -ge 18) {
            Write-Info "Node.js version is compatible (18+)"
            return
        } else {
            Write-Warning "Node.js version is too old. Need version 18 or higher."
        }
    }
    
    Write-Step "Please install Node.js manually:"
    Write-Host "1. Visit: https://nodejs.org" -ForegroundColor White
    Write-Host "2. Download the LTS version" -ForegroundColor White
    Write-Host "3. Run the installer" -ForegroundColor White
    Write-Host "4. Restart your terminal" -ForegroundColor White
    
    $open = Read-Host "Open nodejs.org in browser? (y/n)"
    if ($open -eq "y" -or $open -eq "Y") {
        Start-Process "https://nodejs.org"
    }
}

function Install-Docker {
    Write-Title "Installing Docker Desktop"
    
    if (Get-Command "docker" -ErrorAction SilentlyContinue) {
        Write-Info "Docker is already installed"
        docker --version
        return
    }
    
    Write-Step "Please install Docker Desktop manually:"
    Write-Host "1. Visit: https://www.docker.com/products/docker-desktop/" -ForegroundColor White
    Write-Host "2. Download Docker Desktop for Windows" -ForegroundColor White
    Write-Host "3. Run the installer" -ForegroundColor White
    Write-Host "4. Restart your computer if required" -ForegroundColor White
    Write-Host "5. Start Docker Desktop" -ForegroundColor White
    
    $open = Read-Host "Open Docker website in browser? (y/n)"
    if ($open -eq "y" -or $open -eq "Y") {
        Start-Process "https://www.docker.com/products/docker-desktop/"
    }
}

function Install-All {
    Write-Title "PeluPrice Development Environment Setup"
    Write-Info "This script will help you install the prerequisites for PeluPrice development on Windows"
    
    Install-UV
    Install-Node
    Install-Docker
    
    Write-Title "Setup Complete!"
    Write-Step "Next steps:"
    Write-Host "1. Restart your terminal" -ForegroundColor White
    Write-Host "2. Navigate to your project directory" -ForegroundColor White
    Write-Host "3. Run: .\dev.ps1 setup" -ForegroundColor White
    Write-Host "4. Run: .\dev.ps1 start" -ForegroundColor White
}

function Show-Help {
    Write-Host "PeluPrice Windows Setup Script" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\setup-windows.ps1 [options]" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -All     Install all prerequisites (default)" -ForegroundColor White
    Write-Host "  -UV      Install UV package manager only" -ForegroundColor White
    Write-Host "  -Node    Install Node.js only" -ForegroundColor White
    Write-Host "  -Docker  Install Docker Desktop only" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\setup-windows.ps1              # Install all" -ForegroundColor Gray
    Write-Host "  .\setup-windows.ps1 -UV          # Install UV only" -ForegroundColor Gray
    Write-Host "  .\setup-windows.ps1 -Node        # Install Node.js only" -ForegroundColor Gray
}

# Main execution
if (-not $UV -and -not $Node -and -not $Docker) {
    $All = $true
}

if ($All) {
    Install-All
} else {
    if ($UV) { Install-UV }
    if ($Node) { Install-Node }
    if ($Docker) { Install-Docker }
}

Write-Host ""
Write-Info "Setup script completed!"
