import { config } from './config';
import { User, Device, AuthTokens, LoginRequest, RegisterRequest, ActivationRequest, ApiResponse } from './types';

// Utility function to generate unique IDs
const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Demo data
const demoUsers = [
  {
    id: '1',
    email: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    phoneNumber: '+90 555 123 4567',
    password: 'admin',
    createdAt: new Date().toISOString(),
    devices: []
  }
];

// Demo devices helper functions
const getDemoDevices = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('demoDevices');
    return stored ? JSON.parse(stored) : [];
  }
  return [];
};

const setDemoDevices = (devices) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('demoDevices', JSON.stringify(devices));
  }
};

const addDemoDevice = (device) => {
  const devices = getDemoDevices();
  devices.push(device);
  setDemoDevices(devices);
  return device;
};

const updateDemoDevice = (deviceId, updatedData) => {
  const devices = getDemoDevices();
  const index = devices.findIndex(d => d.id === deviceId);
  if (index !== -1) {
    devices[index] = { ...devices[index], ...updatedData, updatedAt: new Date().toISOString() };
    setDemoDevices(devices);
    return devices[index];
  }
  return null;
};

const deleteDemoDevice = (deviceId) => {
  const devices = getDemoDevices();
  const filteredDevices = devices.filter(d => d.id !== deviceId);
  setDemoDevices(filteredDevices);
  return true;
};

const iseDemoCode = (code) => {
  return config.demoCodes.includes(code);
};

// Token storage
let authTokens = null;

export const getAuthTokens = () => {
  if (typeof window !== 'undefined' && !authTokens) {
    // Önce localStorage'dan kontrol et
    let stored = localStorage.getItem('authTokens');
    if (!stored) {
      // localStorage'da yoksa sessionStorage'dan kontrol et
      stored = sessionStorage.getItem('authTokens');
    }
    
    if (stored) {
      authTokens = JSON.parse(stored);
    }
  }
  return authTokens;
};

export const setAuthTokens = (tokens) => {
  authTokens = tokens;
  if (typeof window !== 'undefined') {
    if (tokens) {
      // Remember me durumuna göre storage seç
      const rememberMe = tokens.rememberMe || localStorage.getItem('rememberMe') === 'true';
      
      if (rememberMe) {
        // Remember me aktifse localStorage kullan
        localStorage.setItem('authTokens', JSON.stringify(tokens));
        sessionStorage.removeItem('authTokens'); // sessionStorage'dan temizle
      } else {
        // Remember me yoksa sessionStorage kullan
        sessionStorage.setItem('authTokens', JSON.stringify(tokens));
        localStorage.removeItem('authTokens'); // localStorage'dan temizle
      }
    } else {
      // Token yok, her ikisini de temizle
      localStorage.removeItem('authTokens');
      sessionStorage.removeItem('authTokens');
    }
  }
};

export const clearAuthTokens = () => {
  authTokens = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authTokens');
    sessionStorage.removeItem('authTokens');
  }
};

export const isAuthenticated = () => {
  const tokens = getAuthTokens();
  if (!tokens) return false;
  
  // Token varsa authenticated say - remember me mantığını login sırasında hallettik
  return true;
};

// API functions
export const login = async (data) => {
  if (config.isDemoMode) {
    // Demo login
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    const user = demoUsers.find(u => u.email === data.email && u.password === data.password);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const tokens = {
      accessToken: 'demo-access-token',
      refreshToken: 'demo-refresh-token',
      rememberMe: data.rememberMe || false
    };

    setAuthTokens(tokens);
    
    // Remember me özelliği için ayrı storage kullan
    if (data.rememberMe) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('rememberMe', 'true');
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('rememberMe');
      }
    }
    
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          createdAt: user.createdAt
        },
        tokens
      }
    };
  } else {
    // Real API call
    const response = await fetch(`${config.apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        remember_me: data.rememberMe || false
      }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const result = await response.json();
    
    // Backend'den gelen format: { access_token, token_type, expires_in, user }
    // Frontend'in beklediği format: { data: { user, tokens } }
    const tokens = {
      accessToken: result.access_token,
      refreshToken: result.refresh_token || null, // Eğer varsa
      tokenType: result.token_type,
      expiresIn: result.expires_in,
      rememberMe: data.rememberMe || false
    };
    
    setAuthTokens(tokens);
    
    // Remember me özelliği için ayrı storage kullan
    if (data.rememberMe) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('rememberMe', 'true');
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('rememberMe');
      }
    }
    
    return {
      success: true,
      data: {
        user: {
          id: result.user.id.toString(),
          email: result.user.email,
          firstName: result.user.first_name,
          lastName: result.user.last_name,
          phoneNumber: result.user.phone_number,
          createdAt: result.user.created_at
        },
        tokens
      }
    };
  }
};

export const register = async (data) => {
  if (config.isDemoMode) {
    // Demo register
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser = {
      id: Date.now().toString(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      password: data.password,
      createdAt: new Date().toISOString(),
      devices: []
    };

    demoUsers.push(newUser);

    return {
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          phoneNumber: newUser.phoneNumber,
          createdAt: newUser.createdAt
        }
      }
    };
  } else {
    // Real API call
    const response = await fetch(`${config.apiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phoneNumber,
        password: data.password
      }),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    return await response.json();
  }
};

export const logout = async () => {
  clearAuthTokens();
  // Remember me bilgisini de temizle
  if (typeof window !== 'undefined') {
    localStorage.removeItem('rememberMe');
  }
  return { success: true };
};

export const getCurrentUser = async () => {
  if (config.isDemoMode) {
    const tokens = getAuthTokens();
    if (!tokens) {
      throw new Error('Not authenticated');
    }

    return {
      success: true,
      data: demoUsers[0]
    };
  } else {
    const tokens = getAuthTokens();
    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${config.apiUrl}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${tokens.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user');
    }

    const userData = await response.json();
    
    // Backend'den gelen format: { email, first_name, last_name, phone_number, id, created_at }
    // Frontend'in beklediği format: { data: { firstName, lastName, ... } }
    return {
      success: true,
      data: {
        id: userData.id.toString(),
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        phoneNumber: userData.phone_number,
        createdAt: userData.created_at
      }
    };
  }
};

export const getDevices = async () => {
  const tokens = getAuthTokens();
  if (!tokens) {
    throw new Error('Not authenticated');
  }

  // Demo devices (localStorage'dan al)
  const demoDevices = getDemoDevices();
  
  if (config.isDemoMode) {
    // Sadece demo mode'da sadece demo devices döndür
    return {
      success: true,
      data: demoDevices
    };
  } else {
    // Normal mode'da hem demo hem gerçek devices'ları birleştir
    let realDevices = [];
    
    try {
      const response = await fetch(`${config.apiUrl}/devices`, {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        // Backend'den gelen device'ları frontend formatına çevir
        realDevices = result.map(device => ({
          id: device.id,
          userId: device.owner_id?.toString(),
          deviceCode: device.activation_key || device.id,
          name: device.name || `Device ${device.id}`,
          photo: device.photo || null,
          language: device.language || 'tr',
          status: device.status,
          isActive: device.is_active,
          createdAt: device.created_at,
          activatedAt: device.activated_at,
          lastSeen: device.last_seen,
          firmwareVersion: device.firmware_version,
          hardwareVersion: device.hardware_version,
          ipAddress: device.ip_address,
          signalStrength: device.signal_strength,
          batteryLevel: device.battery_level,
          settings: device.settings || {
            coin: 'BTC',
            lowerThreshold: '',
            upperThreshold: '',
            twitterFollow: {
              enabled: false,
              url: ''
            },
            customSound: '',
            voice: 'voice1',
            alarmsEnabled: true,
            portfolio: {
              enabled: false,
              coins: [],
              alertTime: '09:00',
              timezone: 'Europe/Istanbul',
              dailyReportEnabled: true
            }
          },
          updatedAt: device.updated_at || device.created_at
        }));
      }
    } catch (error) {
      console.log('Backend\'e bağlanılamadı, sadece demo devices gösteriliyor');
    }

    // Demo ve gerçek devices'ları birleştir
    const allDevices = [...demoDevices, ...realDevices];
    
    return {
      success: true,
      data: allDevices
    };
  }
};

export const activateDevice = async (data) => {
  const tokens = getAuthTokens();
  if (!tokens) {
    throw new Error('Not authenticated');
  }

  // Demo kod kontrolü
  if (iseDemoCode(data.code)) {
    // Demo device oluştur
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newDevice = {
      id: generateUniqueId(),
      userId: '1',
      deviceCode: data.code,
      name: `Demo Peluş ${data.code}`,
      photo: '/placeholder-plush.jpg',
      language: 'tr',
      settings: {
        coin: 'BTC',
        lowerThreshold: 30000,
        upperThreshold: 70000,
        twitterFollow: {
          enabled: false,
          url: ''
        },
        voice: 'voice1',
        alarmsEnabled: true,
        portfolio: {
          enabled: false,
          coins: [],
          alertTime: '09:00',
          timezone: 'Europe/Istanbul',
          dailyReportEnabled: true
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Demo device'ı localStorage'a ekle
    addDemoDevice(newDevice);

    return {
      success: true,
      data: newDevice
    };
  } else {
    // Gerçek aktivasyon kodu - backend'e gönder
    if (config.isDemoMode) {
      throw new Error('Demo mode\'da gerçek aktivasyon kodları desteklenmez');
    }

    const response = await fetch(`${config.apiUrl}/devices/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.accessToken}`,
      },
      body: JSON.stringify({
        activation_key: data.code
      }),
    });

    if (!response.ok) {
      throw new Error('Device activation failed');
    }

    const result = await response.json();
    
    // Backend response'ını frontend formatına çevir
    return {
      success: true,
      data: {
        id: result.id,
        userId: result.owner_id?.toString(),
        deviceCode: result.activation_key || result.id,
        name: result.name || `Device ${result.id}`,
        photo: result.photo || null,
        language: result.language || 'tr',
        status: result.status,
        isActive: result.is_active,
        createdAt: result.created_at,
        activatedAt: result.activated_at,
        lastSeen: result.last_seen,
        firmwareVersion: result.firmware_version,
        hardwareVersion: result.hardware_version,
        ipAddress: result.ip_address,
        signalStrength: result.signal_strength,
        batteryLevel: result.battery_level,
        settings: result.settings || {
          coin: 'BTC',
          lowerThreshold: '',
          upperThreshold: '',
          twitterFollow: {
            enabled: false,
            url: ''
          },
          customSound: '',
          voice: 'voice1',
          alarmsEnabled: true,
          portfolio: {
            enabled: false,
            coins: [],
            alertTime: '09:00',
            timezone: 'Europe/Istanbul',
            dailyReportEnabled: true
          }
        },
        updatedAt: result.updated_at || result.created_at
      }
    };
  }
};

export const updateDevice = async (deviceId, data) => {
  const tokens = getAuthTokens();
  if (!tokens) {
    throw new Error('Not authenticated');
  }

  // Demo device kontrolü
  const demoDevices = getDemoDevices();
  const isDemoDevice = demoDevices.some(d => d.id === deviceId);

  if (isDemoDevice) {
    // Demo device güncelle
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedDevice = updateDemoDevice(deviceId, data);
    if (!updatedDevice) {
      throw new Error('Device not found');
    }

    return {
      success: true,
      data: updatedDevice
    };
  } else {
    // Gerçek device güncelle
    if (config.isDemoMode) {
      throw new Error('Demo mode\'da gerçek devices güncellenemez');
    }

    // Frontend formatını backend formatına çevir
    const backendData = {
      name: data.name,
      photo: data.photo,
      language: data.language,
      settings: data.settings
    };

    const response = await fetch(`${config.apiUrl}/devices/${deviceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.accessToken}`,
      },
      body: JSON.stringify(backendData),
    });

    if (!response.ok) {
      throw new Error('Failed to update device');
    }

    const result = await response.json();
    
    // Backend response'ını frontend formatına çevir
    return {
      success: true,
      data: {
        id: result.id,
        userId: result.owner_id?.toString(),
        deviceCode: result.activation_key || result.id,
        name: result.name || `Device ${result.id}`,
        photo: result.photo || null,
        language: result.language || 'tr',
        status: result.status,
        isActive: result.is_active,
        createdAt: result.created_at,
        activatedAt: result.activated_at,
        lastSeen: result.last_seen,
        firmwareVersion: result.firmware_version,
        hardwareVersion: result.hardware_version,
        ipAddress: result.ip_address,
        signalStrength: result.signal_strength,
        batteryLevel: result.battery_level,
        settings: result.settings || data.settings,
        updatedAt: result.updated_at || new Date().toISOString()
      }
    };
  }
};

export const deleteDevice = async (deviceId) => {
  const tokens = getAuthTokens();
  if (!tokens) {
    throw new Error('Not authenticated');
  }

  // Demo device kontrolü
  const demoDevices = getDemoDevices();
  const isDemoDevice = demoDevices.some(d => d.id === deviceId);

  if (isDemoDevice) {
    // Demo device sil
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const success = deleteDemoDevice(deviceId);
    if (!success) {
      throw new Error('Device not found');
    }

    return {
      success: true
    };
  } else {
    // Gerçek device sil
    if (config.isDemoMode) {
      throw new Error('Demo mode\'da gerçek devices silinemez');
    }

    const response = await fetch(`${config.apiUrl}/devices/${deviceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${tokens.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete device');
    }

    return await response.json();
  }
};

export const updateProfile = async (profileData) => {
  const tokens = getAuthTokens();
  if (!tokens) {
    throw new Error('Not authenticated');
  }

  if (config.isDemoMode) {
    // Demo mode'da localStorage'daki demo user'ı güncelle
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    // Demo user'ı güncelle
    const demoUser = demoUsers[0];
    demoUser.firstName = profileData.firstName;
    demoUser.lastName = profileData.lastName;
    demoUser.phoneNumber = profileData.phoneNumber;
    
    return {
      success: true,
      data: demoUser
    };
  } else {
    // Gerçek API çağrısı
    const response = await fetch(`${config.apiUrl}/auth/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.accessToken}`,
      },
      body: JSON.stringify({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone_number: profileData.phoneNumber
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    const userData = await response.json();
    
    // Backend'den gelen format: { email, first_name, last_name, phone_number, id, created_at }
    // Frontend'in beklediği format: { data: { firstName, lastName, ... } }
    return {
      success: true,
      data: {
        id: userData.id.toString(),
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        phoneNumber: userData.phone_number,
        createdAt: userData.created_at
      }
    };
  }
};
