import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  signup: (credentials: any) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async (credentials) => {
    const res = await apiClient.post<{ accessToken: string, user: User }>('/auth/login', credentials);
    if (res && res.accessToken) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('userRole', res.user.role);
      }
      set({ token: res.accessToken, user: res.user, isAuthenticated: true });
    }
  },
  signup: async (credentials) => {
    await apiClient.post('/auth/signup', credentials);
  },
  requestPasswordReset: async (email) => {
    await apiClient.post('/auth/forgot-password', { email });
  },
  resetPassword: async (resetToken, newPassword) => {
    await apiClient.post('/auth/reset-password', { resetToken, newPassword });
  },
  logout: () => {
    localStorage.removeItem('accessToken');
    set({ token: null, user: null, isAuthenticated: false });
  },
  checkAuth: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      try {
        const user = await apiClient.get<User>('/auth/me');
        set({ token, user, isAuthenticated: true });
      } catch (e) {
        localStorage.removeItem('accessToken');
        set({ token: null, user: null, isAuthenticated: false });
      }
    } else {
      set({ token: null, user: null, isAuthenticated: false });
    }
  }
}));