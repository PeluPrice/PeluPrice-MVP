# PlushCryptoAlarm - Smart Crypto Alarm System

PlushCryptoAlarm is a Next.js web application for managing crypto price alarms through smart plush devices. The app supports multiple languages, real-time cryptocurrency tracking, and voice-enabled notifications.

## Features

### 🔐 Authentication
- Login/Register system with demo mode
- Mock authentication (admin/admin)
- Remember me functionality
- Refresh token support (stubbed)

### 🧸 Device Management
- Activation code entry for new devices
- Multi-device support
- Device-specific settings and configurations
- Photo upload for device identification

### 💰 Crypto Tracking
- Support for popular cryptocurrencies (BTC, ETH, BNB, etc.)
- Configurable price thresholds (upper/lower limits)
- Real-time price monitoring (stubbed)

### 🔊 Voice & Sound Features
- AI voice selection with language support
- Custom alarm sound upload
- Voice testing functionality
- Multi-language voice options

### 🌍 Internationalization
- Support for 4 languages: Turkish, English, German, French
- Language selector in navigation
- Persistent language preferences

### ⚙️ Configuration Modes
- **Demo Mode**: Uses mock data and in-memory storage
- **API Mode**: Connects to real backend services
- Easy mode switching via environment variables

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Language**: JavaScript/TypeScript
- **Internationalization**: Custom i18n implementation
- **State Management**: React Context
- **Authentication**: JWT tokens (stubbed)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PeluPrice-MVP/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_MODE=demo
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Values | Default |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_MODE` | Application mode | `demo` or `api` | `demo` |
| `NEXT_PUBLIC_APP_URL` | Application URL | URL string | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | URL string | `/api` |

## Demo Mode vs API Mode

### Demo Mode (`NEXT_PUBLIC_MODE=demo`)
- Uses mock data stored in memory
- No real backend required
- Perfect for development and testing
- Login credentials: `admin` / `admin`
- All features work with simulated data

### API Mode (`NEXT_PUBLIC_MODE=api`)
- Connects to real backend API
- Requires backend server running
- Uses real authentication and data storage
- API endpoints under `/app/api/` provide stub implementations

## Key Features & Flow

### Authentication Flow
1. **Login**: Enter credentials (demo: admin/admin)
2. **Token Storage**: JWT tokens stored in localStorage
3. **Route Protection**: Automatic redirect to login if unauthenticated
4. **Context**: Global auth state management

### Device Management Flow
1. **No Devices**: Show activation form
2. **Has Devices**: Display device list
3. **Device Selection**: Navigate to device management
4. **Settings**: Configure coin, thresholds, voice, etc.
5. **Testing**: Test alarm sounds and voices

### Internationalization
- Auto-detect browser language (fallback to Turkish)
- Language switcher in navigation
- Persistent language selection
- Support for 4 languages with easy expansion

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Browser Support

- Chrome (latest)
- Firefox (latest) 
- Safari (latest)
- Edge (latest)

## License

This project is licensed under the MIT License.
