#!/bin/bash
# PeluPrice Development Helper Script

set -e

# Project directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Setup development environment
setup_dev() {
    log_info "Setting up PeluPrice development environment..."
    
    # Check prerequisites
    if ! command_exists "uv"; then
        log_error "uv is not installed. Please install it first:"
        echo "curl -LsSf https://astral.sh/uv/install.sh | sh"
        exit 1
    fi
    
    if ! command_exists "docker"; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists "node"; then
        log_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Setup backend
    log_info "Setting up backend dependencies..."
    cd backend
    uv sync
    cd ..
    
    # Setup frontend  
    log_info "Setting up frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    # Setup environment
    if [ ! -f .env ]; then
        log_info "Creating .env file from example..."
        cp .env.example .env 2>/dev/null || log_warning "No .env.example found"
    fi
    
    log_success "Development environment setup complete!"
    log_info "Next steps:"
    echo "1. Configure your .env file"
    echo "2. Run 'docker-compose up -d' to start services"
    echo "3. Run './dev.sh start' to start development servers"
}

# Start development servers
start_dev() {
    log_info "Starting development environment..."
    
    # Check if required dependencies are installed
    log_info "Checking Python environment..."
    if ! command -v uv &> /dev/null; then
        log_error "uv is not installed. Please install it first: curl -LsSf https://astral.sh/uv/install.sh | sh"
        exit 1
    fi
    
    # Start services with proper environment
    if [[ "$1" == "docker" ]]; then
        log_info "Starting with Docker Compose..."
        docker-compose up --build
    else
        log_info "Starting development servers..."
        
        # Start backend
        log_info "Starting backend server..."
        cd "$BACKEND_DIR"
        
        # Ensure dependencies are synced
        log_info "Syncing dependencies..."
        uv sync
        
        # Start backend with uv run
        log_info "Starting uvicorn server..."
        uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
        BACKEND_PID=$!
        
        # Start frontend 
        log_info "Starting frontend server..."
        cd "$FRONTEND_DIR"
        npm run dev &
        FRONTEND_PID=$!
        
        # Wait and show status
        sleep 3
        log_success "✅ Backend running at: http://localhost:8000"
        log_success "✅ Frontend running at: http://localhost:3000"
        log_info "Press Ctrl+C to stop all servers"
        
        # Wait for interrupt
        trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; log_info "Servers stopped"; exit 0' INT
        wait
    fi
}

# Initialize database
init_db() {
    log_info "Initializing database..."
    cd backend
    uv run ../scripts/init_db.py
    cd ..
    log_success "Database initialized!"
}

# Run tests
test() {
    log_info "Running tests..."
    cd backend
    uv run pytest
    cd ..
    log_success "Tests completed!"
}

# Show help
show_help() {
    echo "PeluPrice Development Helper"
    echo ""
    echo "Usage: ./dev.sh <command>"
    echo ""
    echo "Commands:"
    echo "  setup     - Setup development environment"
    echo "  start     - Start development servers"
    echo "  init-db   - Initialize database"
    echo "  test      - Run tests"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./dev.sh setup"
    echo "  ./dev.sh start"
}

# Main script logic
case "${1:-help}" in
    "setup")
        setup_dev
        ;;
    "start")
        start_dev
        ;;
    "init-db")
        init_db
        ;;
    "test")
        test
        ;;
    "help"|*)
        show_help
        ;;
esac
