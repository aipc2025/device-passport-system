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
  uploadFile: async (file: File, fileCategory: string, passportCode?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileCategory', fileCategory);
    if (passportCode) {
      formData.append('passportCode', passportCode);
    }
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

// ==========================================
// Marketplace APIs
// ==========================================

export interface MarketplaceSearchParams {
  keyword?: string;
  category?: string;
  hsCode?: string;
  priceMin?: number;
  priceMax?: number;
  region?: string;
  userLat?: number;
  userLng?: number;
  maxDistanceKm?: number;
  sortBy?: 'createdAt' | 'price' | 'distance' | 'viewCount';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
  featuredFirst?: boolean;
}

// Marketplace Products API
export const marketplaceProductApi = {
  // Public endpoints
  search: async (params?: MarketplaceSearchParams) => {
    const response = await api.get('/marketplace/products', { params });
    return response.data.data || response.data;
  },
  getFeatured: async (limit = 12) => {
    const response = await api.get('/marketplace/products/featured', { params: { limit } });
    return response.data.data || response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/marketplace/products/${id}`);
    return response.data.data || response.data;
  },
  // Supplier endpoints
  getMyProducts: async () => {
    const response = await api.get('/marketplace/products/my/list');
    return response.data.data || response.data;
  },
  create: async (data: Record<string, unknown>) => {
    const response = await api.post('/marketplace/products', data);
    return response.data.data || response.data;
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const response = await api.patch(`/marketplace/products/${id}`, data);
    return response.data.data || response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/marketplace/products/${id}`);
    return response.data.data || response.data;
  },
  pause: async (id: string) => {
    const response = await api.post(`/marketplace/products/${id}/pause`);
    return response.data.data || response.data;
  },
  activate: async (id: string) => {
    const response = await api.post(`/marketplace/products/${id}/activate`);
    return response.data.data || response.data;
  },
};

// Marketplace Requirements (RFQ) API
export const marketplaceRfqApi = {
  // Public endpoints
  search: async (params?: MarketplaceSearchParams) => {
    const response = await api.get('/marketplace/requirements', { params });
    return response.data.data || response.data;
  },
  getRecent: async (limit = 12) => {
    const response = await api.get('/marketplace/requirements/recent', { params: { limit } });
    return response.data.data || response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/marketplace/requirements/${id}`);
    return response.data.data || response.data;
  },
  // Buyer endpoints
  getMyRfqs: async () => {
    const response = await api.get('/marketplace/requirements/my/list');
    return response.data.data || response.data;
  },
  create: async (data: Record<string, unknown>) => {
    const response = await api.post('/marketplace/requirements', data);
    return response.data.data || response.data;
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const response = await api.patch(`/marketplace/requirements/${id}`, data);
    return response.data.data || response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/marketplace/requirements/${id}`);
    return response.data.data || response.data;
  },
};

// Matching API
export const matchingApi = {
  getRecommendations: async (role: 'supplier' | 'buyer', limit = 20, includeViewed = false) => {
    const response = await api.get('/matching/recommendations', {
      params: { role, limit, includeViewed },
    });
    return response.data.data || response.data;
  },
  getMatchById: async (id: string, role: 'supplier' | 'buyer') => {
    const response = await api.get(`/matching/recommendations/${id}`, {
      params: { role },
    });
    return response.data.data || response.data;
  },
  dismissMatch: async (id: string) => {
    const response = await api.post(`/matching/recommendations/${id}/dismiss`);
    return response.data.data || response.data;
  },
  triggerMatching: async () => {
    const response = await api.post('/matching/trigger');
    return response.data.data || response.data;
  },
  getStats: async () => {
    const response = await api.get('/matching/stats');
    return response.data.data || response.data;
  },
  // Admin endpoint to forward buyer requirement to specific suppliers
  forwardRequirement: async (requirementId: string, supplierOrgIds: string[], matchSource?: string) => {
    const response = await api.post(`/matching/forward-requirement/${requirementId}`, {
      supplierOrgIds,
      matchSource,
    });
    return response.data.data || response.data;
  },
};

// Inquiry API
export const inquiryApi = {
  getAll: async () => {
    const response = await api.get('/inquiries');
    return response.data;
  },
  getSent: async () => {
    const response = await api.get('/inquiries/sent');
    return response.data;
  },
  getReceived: async () => {
    const response = await api.get('/inquiries/received');
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await api.get('/inquiries/unread-count');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/inquiries/${id}`);
    return response.data;
  },
  create: async (data: Record<string, unknown>) => {
    const response = await api.post('/inquiries', data);
    return response.data;
  },
  updateStatus: async (id: string, data: { status: string; closeReason?: string }) => {
    const response = await api.patch(`/inquiries/${id}/status`, data);
    return response.data;
  },
  getMessages: async (id: string) => {
    const response = await api.get(`/inquiries/${id}/messages`);
    return response.data;
  },
  sendMessage: async (id: string, data: Record<string, unknown>) => {
    const response = await api.post(`/inquiries/${id}/messages`, data);
    return response.data;
  },
  markAsRead: async (id: string) => {
    const response = await api.patch(`/inquiries/${id}/messages/read`);
    return response.data;
  },
};

// Saved Items API
export const savedApi = {
  getAll: async () => {
    const response = await api.get('/saved');
    return response.data;
  },
  getSuppliers: async () => {
    const response = await api.get('/saved/suppliers');
    return response.data;
  },
  getProducts: async () => {
    const response = await api.get('/saved/products');
    return response.data;
  },
  getRfqs: async () => {
    const response = await api.get('/saved/rfqs');
    return response.data;
  },
  checkSaved: async (type: string, itemId: string) => {
    const response = await api.get('/saved/check', { params: { type, itemId } });
    return response.data;
  },
  save: async (data: { itemType: string; itemId: string; notes?: string }) => {
    const response = await api.post('/saved', data);
    return response.data;
  },
  remove: async (id: string) => {
    const response = await api.delete(`/saved/${id}`);
    return response.data;
  },
};

// ==========================================
// Expert APIs
// ==========================================

export const expertApi = {
  // Profile management
  getProfile: async (expertId: string) => {
    const response = await api.get(`/experts/${expertId}`);
    return response.data.data || response.data;
  },
  updateProfile: async (expertId: string, data: Record<string, unknown>) => {
    const response = await api.patch(`/experts/${expertId}`, data);
    return response.data.data || response.data;
  },
  // Expert Passport
  getPassport: async (expertId: string) => {
    const response = await api.get(`/experts/${expertId}/passport`);
    return response.data.data || response.data;
  },
  // Location management
  updateLocation: async (expertId: string, data: { latitude?: number; longitude?: number; currentLocation?: string }) => {
    const response = await api.patch(`/experts/${expertId}/location`, data);
    return response.data.data || response.data;
  },
  // Availability management
  updateAvailability: async (expertId: string, data: { isAvailable?: boolean; serviceRadius?: number }) => {
    const response = await api.patch(`/experts/${expertId}/availability`, data);
    return response.data.data || response.data;
  },
  // Skills management
  updateSkills: async (expertId: string, skillTags: string[]) => {
    const response = await api.patch(`/experts/${expertId}/skills`, { skillTags });
    return response.data.data || response.data;
  },
  // Service records
  getServiceRecords: async (expertId: string) => {
    const response = await api.get(`/experts/${expertId}/service-records`);
    return response.data.data || response.data;
  },
  // Matches
  getMatches: async (expertId: string, limit = 50) => {
    const response = await api.get(`/experts/${expertId}/matches`, { params: { limit } });
    return response.data.data || response.data;
  },
  dismissMatch: async (matchId: string) => {
    const response = await api.post(`/experts/matches/${matchId}/dismiss`);
    return response.data.data || response.data;
  },
  // Service Hall (public service requests)
  getPublicServiceRequests: async (params?: { search?: string; serviceType?: string; urgency?: string; limit?: number; offset?: number }) => {
    const response = await api.get('/service-requests/public', { params });
    return response.data.data || response.data;
  },
  getServiceRequestDetail: async (id: string) => {
    const response = await api.get(`/service-requests/public/${id}`);
    return response.data.data || response.data;
  },
  getServiceTypes: async () => {
    const response = await api.get('/service-requests/types');
    return response.data.data || response.data;
  },
  applyForService: async (serviceRequestId: string, data?: Record<string, unknown>) => {
    const response = await api.post(`/service-requests/${serviceRequestId}/apply`, data);
    return response.data.data || response.data;
  },
  getMyApplications: async () => {
    const response = await api.get('/service-requests/applications/my');
    return response.data.data || response.data;
  },
  withdrawApplication: async (applicationId: string) => {
    const response = await api.delete(`/service-requests/applications/${applicationId}`);
    return response.data.data || response.data;
  },
  // Expert Matching
  getExpertMatches: async (limit = 50) => {
    const response = await api.get('/expert-matching/expert/my', { params: { limit } });
    return response.data.data || response.data;
  },
  viewExpertMatch: async (matchId: string) => {
    const response = await api.post(`/expert-matching/${matchId}/view`);
    return response.data.data || response.data;
  },
  dismissExpertMatch: async (matchId: string) => {
    const response = await api.post(`/expert-matching/${matchId}/dismiss`);
    return response.data.data || response.data;
  },
};

// ==========================================
// Expert Rating APIs
// ==========================================

export interface CreateServiceRecordDto {
  serviceRequestId: string;
  expertId: string;
  agreedPrice: number;
  priceCurrency?: string;
  estimatedDuration?: string;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  expertNotes?: string;
}

export interface CreateReviewDto {
  serviceRecordId: string;
  overallRating: number;
  qualityRating?: number;
  communicationRating?: number;
  punctualityRating?: number;
  professionalismRating?: number;
  valueRating?: number;
  title?: string;
  comment?: string;
  pros?: string[];
  cons?: string[];
}

export const ratingApi = {
  // Service Records
  createServiceRecord: async (data: CreateServiceRecordDto) => {
    const response = await api.post('/expert-rating/service-records', data);
    return response.data.data || response.data;
  },
  getServiceRecord: async (id: string) => {
    const response = await api.get(`/expert-rating/service-records/${id}`);
    return response.data.data || response.data;
  },
  getExpertServiceRecords: async (expertId: string, status?: string, limit = 50) => {
    const response = await api.get(`/expert-rating/service-records/expert/${expertId}`, {
      params: { status, limit },
    });
    return response.data.data || response.data;
  },
  getMyServiceRecords: async (status?: string, limit = 50) => {
    const response = await api.get('/expert-rating/service-records/customer/my', {
      params: { status, limit },
    });
    return response.data.data || response.data;
  },
  updateServiceRecord: async (id: string, data: Record<string, unknown>) => {
    const response = await api.patch(`/expert-rating/service-records/${id}`, data);
    return response.data.data || response.data;
  },
  startService: async (id: string) => {
    const response = await api.post(`/expert-rating/service-records/${id}/start`);
    return response.data.data || response.data;
  },
  completeService: async (id: string, data?: { finalPrice?: number; completionNotes?: string }) => {
    const response = await api.post(`/expert-rating/service-records/${id}/complete`, data);
    return response.data.data || response.data;
  },
  confirmCompletion: async (id: string) => {
    const response = await api.post(`/expert-rating/service-records/${id}/confirm`);
    return response.data.data || response.data;
  },
  cancelService: async (id: string, reason?: string) => {
    const response = await api.post(`/expert-rating/service-records/${id}/cancel`, { reason });
    return response.data.data || response.data;
  },

  // Reviews
  createReview: async (data: CreateReviewDto) => {
    const response = await api.post('/expert-rating/reviews', data);
    return response.data.data || response.data;
  },
  getReview: async (id: string) => {
    const response = await api.get(`/expert-rating/reviews/${id}`);
    return response.data.data || response.data;
  },
  getExpertReviews: async (expertId: string, limit = 50) => {
    const response = await api.get(`/expert-rating/reviews/expert/${expertId}`, {
      params: { limit },
    });
    return response.data.data || response.data;
  },
  respondToReview: async (reviewId: string, response: string) => {
    const res = await api.post(`/expert-rating/reviews/${reviewId}/respond`, { response });
    return res.data.data || res.data;
  },
  flagReview: async (reviewId: string, reason: string) => {
    const response = await api.post(`/expert-rating/reviews/${reviewId}/flag`, { reason });
    return response.data.data || response.data;
  },
  voteReview: async (reviewId: string, isHelpful: boolean) => {
    const response = await api.post(`/expert-rating/reviews/${reviewId}/vote`, { isHelpful });
    return response.data.data || response.data;
  },

  // Rating Summary
  getExpertRatingSummary: async (expertId: string) => {
    const response = await api.get(`/expert-rating/summary/${expertId}`);
    return response.data.data || response.data;
  },
};
