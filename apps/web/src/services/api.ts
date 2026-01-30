import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data.data;
  },
  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data.data;
  },
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data.data;
  },
};

// Scan API (public)
export const scanApi = {
  getPublicInfo: async (code: string) => {
    const response = await api.get(`/scan/${code}`);
    return response.data.data;
  },
  validateCode: async (code: string) => {
    const response = await api.get(`/scan/${code}/validate`);
    return response.data.data;
  },
};

// Passport API
export const passportApi = {
  getAll: async (params?: Record<string, unknown>) => {
    const response = await api.get('/passports', { params });
    return response.data.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/passports/${id}`);
    return response.data.data;
  },
  create: async (data: Record<string, unknown>) => {
    const response = await api.post('/passports', data);
    return response.data.data;
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const response = await api.patch(`/passports/${id}`, data);
    return response.data.data;
  },
  updateStatus: async (id: string, data: { status: string; note?: string; location?: string }) => {
    const response = await api.patch(`/passports/${id}/status`, data);
    return response.data.data;
  },
  getQRCode: async (id: string) => {
    const response = await api.get(`/passports/${id}/qrcode`);
    return response.data.data;
  },
  getLifecycle: async (id: string, params?: Record<string, unknown>) => {
    const response = await api.get(`/lifecycle/passport/${id}`, { params });
    return response.data.data;
  },
};

// Service Order API
export const serviceOrderApi = {
  getAll: async (params?: Record<string, unknown>) => {
    const response = await api.get('/service-orders', { params });
    return response.data.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/service-orders/${id}`);
    return response.data.data;
  },
  create: async (data: Record<string, unknown>) => {
    const response = await api.post('/service-orders', data);
    return response.data.data;
  },
  createPublic: async (data: Record<string, unknown>) => {
    const response = await api.post('/service-orders/public-request', data);
    return response.data.data;
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const response = await api.patch(`/service-orders/${id}`, data);
    return response.data.data;
  },
  getRecords: async (id: string) => {
    const response = await api.get(`/service-orders/${id}/records`);
    return response.data.data;
  },
  addRecord: async (id: string, data: Record<string, unknown>) => {
    const response = await api.post(`/service-orders/${id}/records`, data);
    return response.data.data;
  },
};
