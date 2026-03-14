import { api } from './axios';

export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  points: number;
  role: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export const authApi = {
  async login(username: string, password: string, turnstileToken?: string): Promise<AuthResponse> {
    const response = await api.post('/auth/login', { username, password, turnstileToken });
    return response.data;
  },

  async register(userData: {
    username: string;
    email: string;
    phone?: string;
    password: string;
    role?: number;
    turnstileToken?: string;
  }): Promise<AuthResponse> {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async getCurrentUser(): Promise<AuthResponse> {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
