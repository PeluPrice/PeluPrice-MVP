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

const demoDevices = [
  {
    id: 'device1',
    userId: '1',
    deviceCode: 'DEMO123',
    name: 'My First Plush',
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
      voice: 'voice1'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Token storage
let authTokens = null;

export const getAuthTokens = () => {
  if (typeof window !== 'undefined' && !authTokens) {
    const stored = localStorage.getItem('authTokens');
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
      localStorage.setItem('authTokens', JSON.stringify(tokens));
    } else {
      localStorage.removeItem('authTokens');
    }
  }
};

export const clearAuthTokens = () => {
  setAuthTokens(null);
};

export const isAuthenticated = () => {
  return !!getAuthTokens();
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
      refreshToken: 'demo-refresh-token'
    };

    setAuthTokens(tokens);
    
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
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const result = await response.json();
    setAuthTokens(result.data.tokens);
    return result;
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
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    return await response.json();
  }
};

export const logout = async () => {
  clearAuthTokens();
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

    return await response.json();
  }
};

export const getDevices = async () => {
  if (config.isDemoMode) {
    const tokens = getAuthTokens();
    if (!tokens) {
      throw new Error('Not authenticated');
    }

    return {
      success: true,
      data: demoDevices
    };
  } else {
    const tokens = getAuthTokens();
    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${config.apiUrl}/devices`, {
      headers: {
        'Authorization': `Bearer ${tokens.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get devices');
    }

    return await response.json();
  }
};

export const activateDevice = async (data) => {
  if (config.isDemoMode) {
    const tokens = getAuthTokens();
    if (!tokens) {
      throw new Error('Not authenticated');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create new demo device
    const newDevice = {
      id: generateUniqueId(),
      userId: '1',
      deviceCode: data.code,
      name: `Plush Device ${data.code}`,
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
        voice: 'voice1'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    demoDevices.push(newDevice);

    return {
      success: true,
      data: newDevice
    };
  } else {
    const tokens = getAuthTokens();
    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${config.apiUrl}/devices/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Device activation failed');
    }

    return await response.json();
  }
};

export const updateDevice = async (deviceId, data) => {
  if (config.isDemoMode) {
    const tokens = getAuthTokens();
    if (!tokens) {
      throw new Error('Not authenticated');
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const deviceIndex = demoDevices.findIndex(d => d.id === deviceId);
    if (deviceIndex === -1) {
      throw new Error('Device not found');
    }

    demoDevices[deviceIndex] = {
      ...demoDevices[deviceIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };

    return {
      success: true,
      data: demoDevices[deviceIndex]
    };
  } else {
    const tokens = getAuthTokens();
    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${config.apiUrl}/devices/${deviceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update device');
    }

    return await response.json();
  }
};

export const deleteDevice = async (deviceId) => {
  if (config.isDemoMode) {
    const tokens = getAuthTokens();
    if (!tokens) {
      throw new Error('Not authenticated');
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const deviceIndex = demoDevices.findIndex(d => d.id === deviceId);
    if (deviceIndex === -1) {
      throw new Error('Device not found');
    }

    demoDevices.splice(deviceIndex, 1);

    return {
      success: true
    };
  } else {
    const tokens = getAuthTokens();
    if (!tokens) {
      throw new Error('Not authenticated');
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
