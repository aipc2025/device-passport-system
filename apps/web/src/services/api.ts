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

// Organization/Supplier API
export const organizationApi = {
  getAll: async (type?: string) => {
    const params = type ? { type } : {};
    const response = await api.get('/organizations', { params });
    return response.data.data;
  },
  getSuppliers: async () => {
    const response = await api.get('/organizations/suppliers');
    return response.data.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/organizations/${id}`);
    return response.data.data;
  },
  create: async (data: Record<string, unknown>) => {
    const response = await api.post('/organizations', data);
    return response.data.data;
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const response = await api.patch(`/organizations/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/organizations/${id}`);
    return response.data.data;
  },
};

// Product Type API
export const productTypeApi = {
  getAll: async (includeInactive = false) => {
    const response = await api.get('/product-types', { params: { includeInactive } });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/product-types/${id}`);
    return response.data;
  },
  create: async (data: Record<string, unknown>) => {
    const response = await api.post('/product-types', data);
    return response.data;
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const response = await api.patch(`/product-types/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/product-types/${id}`);
    return response.data;
  },
  toggleActive: async (id: string) => {
    const response = await api.patch(`/product-types/${id}/toggle-active`);
    return response.data;
  },
};

// Upload API
export const uploadApi = {
  uploadFile: async (file: File, fileCategory: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileCategory', fileCategory);
    const response = await api.post('/upload/public', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  uploadMultiple: async (files: File[], fileCategory: string) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('fileCategory', fileCategory);
    const response = await api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  getFile: async (id: string) => {
    const response = await api.get(`/upload/${id}`);
    return response.data;
  },
  deleteFile: async (id: string) => {
    const response = await api.delete(`/upload/${id}`);
    return response.data;
  },
};

// Registration API
export const registrationApi = {
  checkCodeAvailability: async (code: string) => {
    const response = await api.get(`/registration/check-code/${code}`);
    return response.data.data;
  },
  registerCompany: async (data: Record<string, unknown>) => {
    const response = await api.post('/registration/company', data);
    return response.data;
  },
  registerExpert: async (data: Record<string, unknown>) => {
    const response = await api.post('/registration/expert', data);
    return response.data;
  },
  getStatus: async () => {
    const response = await api.get('/registration/status');
    return response.data.data;
  },
  getPending: async () => {
    const response = await api.get('/registration/pending');
    return response.data.data;
  },
  getCompanyDetails: async (id: string) => {
    const response = await api.get(`/registration/company/${id}`);
    return response.data.data;
  },
  getExpertDetails: async (id: string) => {
    const response = await api.get(`/registration/expert/${id}`);
    return response.data.data;
  },
  updateStatus: async (id: string, type: string, data: { status: string; adminNotes?: string }) => {
    const response = await api.patch(`/registration/${id}/status?type=${type}`, data);
    return response.data;
  },
};

// Contact API
export const contactApi = {
  getAll: async (orgId: string) => {
    const response = await api.get(`/organizations/${orgId}/contacts`);
    return response.data.data;
  },
  create: async (orgId: string, data: Record<string, unknown>) => {
    const response = await api.post(`/organizations/${orgId}/contacts`, data);
    return response.data.data;
  },
  update: async (orgId: string, id: string, data: Record<string, unknown>) => {
    const response = await api.patch(`/organizations/${orgId}/contacts/${id}`, data);
    return response.data.data;
  },
  delete: async (orgId: string, id: string) => {
    const response = await api.delete(`/organizations/${orgId}/contacts/${id}`);
    return response.data;
  },
};

// Supplier Product API
export const supplierProductApi = {
  getAll: async (orgId: string, includeInactive = false) => {
    const response = await api.get(`/organizations/${orgId}/products`, {
      params: { includeInactive },
    });
    return response.data.data;
  },
  create: async (orgId: string, data: Record<string, unknown>) => {
    const response = await api.post(`/organizations/${orgId}/products`, data);
    return response.data.data;
  },
  update: async (orgId: string, id: string, data: Record<string, unknown>) => {
    const response = await api.patch(`/organizations/${orgId}/products/${id}`, data);
    return response.data.data;
  },
  delete: async (orgId: string, id: string) => {
    const response = await api.delete(`/organizations/${orgId}/products/${id}`);
    return response.data;
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
