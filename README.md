# PeluPrice - IoT Device Management Platform

PeluPrice is a comprehensive IoT device management platform that allows users to activate, monitor, and control smart devices through a web dashboard and mobile app.

[![Watch the video](https://www.youtube.com/watch?v=UkPb4PXKp7E)

🔗 [Live Demo](https://peluprice.webinen.com)


## 🏗 Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   IoT Device    │────-│  MQTT Broker    │────-│    Backend      │
│   (ESP32/WiFi)  │     │  (Mosquitto)    │     │   (FastAPI)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                               │
         │              ┌─────────────────┐              │
         └──────────────│   PostgreSQL    │──────────────┘
                        │    Database     │
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │    Frontend     │
                        │   (Next.js)     │
                        └─────────────────┘
```

## 🚀 Features

### Device Management
- **Device Registration**: Automatic device registration with unique activation keys
- **Device Activation**: User-friendly device activation process using activation cards
- **Real-time Status**: Live device status monitoring and heartbeat tracking
- **Remote Control**: Send commands to devices (alarm, LED control, etc.)

### User Management
- **Authentication**: JWT-based secure user authentication
- **Device Ownership**: Users can activate and own multiple devices
- **Dashboard**: Web-based dashboard for device management

### Communication
- **MQTT**: Real-time communication between devices and backend
- **WebSocket**: Live updates for web dashboard
- **HTTP APIs**: RESTful APIs for all operations

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for frontend development)
- Python 3.9+ with `uv` package manager (for backend development)
- PlatformIO (for firmware development)

### Installing uv
```bash
# On macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# On Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Verify installation
uv --version
```

## 🛠 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/PeluPrice/PeluPrice-MVP.git
cd PeluPrice-MVP
```

### 2. Development Setup (Recommended)
Use our development helper script for quick setup:

**For macOS/Linux:**
```bash
# Make script executable
chmod +x dev.sh

# Setup development environment
./dev.sh setup

# Start development servers
./dev.sh start
```

**For Windows (PowerShell - Recommended):**
```powershell
# Setup development environment
.\dev.ps1 setup

# Start development servers
.\dev.ps1 start

# Or with Docker
.\dev.ps1 start -Docker
```

**For Windows (Batch):**
```cmd
REM Setup development environment
dev.bat setup

REM Start development servers
dev.bat start

REM Or use the simplified version (recommended)
dev-simple.bat setup
dev-simple.bat start

REM Or with Docker
dev.bat start docker
```

### 3. Manual Setup
If you prefer manual setup:

```bash
# Environment setup
cp .env.example .env
# Edit .env with your configuration

# Start services
docker-compose up -d

# Setup backend
cd backend && uv sync && cd ..

# Setup frontend
cd frontend && npm install && cd ..
```

### 4. Access the Application
- **Web Dashboard**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **Admin Panel**: http://localhost:8000/admin

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DOMAIN` | Your domain name | `peluprice.com` |
| `DATABASE_URL` | PostgreSQL connection string | Auto-generated |
| `JWT_SECRET_KEY` | Secret key for JWT tokens | Generate new |
| `MQTT_HOST` | MQTT broker hostname | `mqtt` |
| `SMTP_*` | Email configuration | Configure for production |

### MQTT Topics Structure
```
peluprice/
├── devices/
│   └── {device_id}/
│       ├── commands     # Backend → Device
│       ├── status       # Device → Backend
│       ├── heartbeat    # Device → Backend
│       └── data         # Device → Backend
└── notifications/
    └── {type}/          # System notifications
```

## 📁 Project Structure

```
PeluPrice-MVP/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── auth/           # Authentication logic
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   ├── ws/             # WebSocket handlers
│   │   └── main.py         # FastAPI app
│   ├── pyproject.toml      # uv dependencies
│   ├── uv.lock            # Locked dependencies
│   └── Dockerfile
├── frontend/               # Next.js frontend
│   ├── src/
│   │   └── app/           # App router pages
│   ├── package.json
│   └── Dockerfile
├── firmware/              # Device firmware
│   ├── esp32/
│   │   ├── src/main.cpp   # ESP32 firmware
│   │   └── platformio.ini
│   └── arduino/
├── mqtt/                  # MQTT broker config
│   └── config/
├── scripts/               # Utility scripts
│   └── init_db.py        # Database initialization
├── docker-compose.yml     # Service orchestration
├── .env                   # Environment variables
└── README.md
```

## 💻 Windows Development Setup

For Windows developers, we provide multiple options to simplify development:

### 🚀 Quick Start (Easiest)
For the simplest setup experience, run:
```cmd
start-windows.bat
```
This interactive script will:
- Check and fix PowerShell execution policy
- Install missing prerequisites (UV, Node.js, Docker)
- Guide you through choosing the best development script
- Set up your development environment

### Quick Windows Setup
Run our automated setup script to install all prerequisites:
```powershell
# Run the setup script (installs UV, checks Node.js, and Docker)
.\setup-windows.ps1

# Or install specific tools only
.\setup-windows.ps1 -UV      # Install UV only
.\setup-windows.ps1 -Node    # Check/install Node.js only
.\setup-windows.ps1 -Docker  # Check/install Docker only
```

### Windows Prerequisites
1. **Install uv**: `powershell -c "irm https://astral.sh/uv/install.ps1 | iex"`
2. **Install Node.js 18+**: Download from [nodejs.org](https://nodejs.org)
3. **Install Docker Desktop**: Download from [docker.com](https://docker.com)

### Available Scripts

#### PowerShell Script (`dev.ps1`) - **Recommended**
```powershell
# Setup development environment
.\dev.ps1 setup

# Start development servers (in background jobs)
.\dev.ps1 start

# Start with Docker Compose
.\dev.ps1 start -Docker

# Initialize database
.\dev.ps1 init-db

# Run tests
.\dev.ps1 test

# Show help
.\dev.ps1 help
```

#### Batch Script (`dev.bat` or `dev-simple.bat`)
```cmd
REM Setup development environment
dev.bat setup
REM OR use simplified version (more reliable)
dev-simple.bat setup

REM Start development servers (opens separate windows)
dev.bat start
REM OR use simplified version
dev-simple.bat start

REM Start with Docker Compose
dev.bat start docker

REM Initialize database
dev.bat init-db
dev-simple.bat init-db

REM Run tests
dev.bat test
dev-simple.bat test

REM Show help
dev.bat help
dev-simple.bat help
```

### Windows-Specific Notes
- **PowerShell script** runs servers as background jobs with better process management
- **Batch script** opens servers in separate Command Prompt windows  
- **dev-simple.bat** is a more reliable version if you encounter issues with dev.bat
- Use PowerShell for better development experience
- Make sure PowerShell execution policy allows scripts: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

## 🏃‍♂️ Development

### Backend Development
```bash
cd backend
# Install dependencies
uv sync

# Run development server (no package build needed)
uv run --no-project uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Alternative: with project (builds package)
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Add new dependencies
uv add <package-name>

# Add development dependencies  
uv add --dev <package-name>

# Run tests
uv run --no-project pytest

# Format code
uv run --no-project black .
uv run --no-project isort .
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Firmware Development
```bash
cd firmware/esp32
pio run -t upload
pio device monitor
```

## 📱 Device Setup Process

### 1. Device States
- **CREATED**: Device manufactured and in inventory
- **DEPLOYED**: Device packaged with activation card
- **DELIVERED**: Device delivered to customer
- **ACTIVATED**: Customer activated device with key
- **WORKING**: Device online and operational
- **OFFLINE**: Device not responding

### 2. Activation Flow
1. Customer receives device with activation card containing unique key
2. Device boots in configuration mode (creates WiFi hotspot)
3. Customer connects to device WiFi and enters:
   - WiFi network credentials
   - Activation key from card
4. Device connects to internet and registers with backend
5. Device status changes to ACTIVATED and assigned to customer
6. Customer can now control device through web dashboard

### 3. Device Commands
Devices support these remote commands via MQTT:
- `alarm`: Trigger audible alarm
- `led`: Control LED (on/off/blink)
- `speak`: Play voice messages (if speaker available)
- `status`: Request immediate status update

## 🔐 Security

- JWT authentication for API access
- MQTT with optional username/password
- HTTPS/TLS in production
- Input validation and sanitization
- Rate limiting on API endpoints

## 📊 Database Schema

### Users
- id, email, password_hash, first_name, last_name, phone_number, created_at

### Devices
- id (UUID), name, activation_key, owner_id, status, created_at, activated_at, last_seen
- firmware_version, hardware_version, ip_address, signal_strength, battery_level

## 🚀 Deployment

### Production Environment
1. Set up domain and SSL certificates
2. Configure production environment variables
3. Use managed database service
4. Set up MQTT broker with authentication
5. Configure email service
6. Deploy using Docker Compose or Kubernetes

### Health Checks
- `/health` - Backend health status
- Database connectivity check
- MQTT broker connectivity check

## 🔧 Common Commands

### Development Helper Script
```bash
# Setup development environment
./dev.sh setup

# Start development servers  
./dev.sh start

# Initialize database
./dev.sh init-db

# Run tests
./dev.sh test

# Show help
./dev.sh help
```

### Backend Management (uv commands)
```bash
# Sync dependencies
uv sync

# Run database migrations
uv run scripts/init_db.py

# Start development server
uv run uvicorn app.main:app --reload

# Run tests
uv run pytest

# Add a new package
uv add requests

# Remove a package
uv remove requests

# Export requirements.txt (for compatibility)
uv export --format requirements-txt --output-file requirements.txt
```

### Docker Commands
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f mqtt

# Rebuild services
docker-compose build --no-cache

# Stop all services
docker-compose down

# Remove all data
docker-compose down -v
```

### Device Management
```bash
# Monitor ESP32 device
cd firmware/esp32
pio device monitor

# Flash firmware
pio run -t upload

# Build firmware only
pio run
```

## 🐛 Troubleshooting

### Backend Issues
- **Import errors**: Run `uv sync` to install dependencies
- **Database errors**: Check DATABASE_URL in `.env` and run `uv run scripts/init_db.py`
- **MQTT connection failed**: Ensure MQTT broker is running (`docker-compose up mqtt`)

### Device Issues
- **Device won't connect**: Check WiFi credentials and server URL
- **Activation failed**: Verify activation key exists in database
- **MQTT not working**: Check MQTT broker logs and device network connectivity

### Frontend Issues
- **API calls failing**: Verify backend is running on port 8000
- **CORS errors**: Check CORS settings in backend main.py

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is proprietary software owned by PeluPrice.

## 📞 Support

For support, email support@peluprice.com or create an issue in this repository.

---

**PeluPrice** - Smart IoT Device Management Made Simple
