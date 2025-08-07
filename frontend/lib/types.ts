export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  createdAt: string;
  devices?: Device[];
}

export interface Device {
  id: string;
  userId: string;
  deviceCode: string;
  name: string;
  photo?: string;
  language: string;
  settings: DeviceSettings;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceSettings {
  coin: string;
  lowerThreshold?: number;
  upperThreshold?: number;
  twitterFollow?: {
    enabled: boolean;
    url: string;
  };
  customSound?: string;
  voice: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
}

export interface ActivationRequest {
  code: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
