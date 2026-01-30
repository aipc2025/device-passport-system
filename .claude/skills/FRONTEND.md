# Frontend Development Skill - React + TypeScript

## Project Setup

```bash
# Create project with Vite
pnpm create vite@latest web --template react-ts
cd web

# Install dependencies
pnpm add react-router-dom @tanstack/react-query zustand axios
pnpm add -D tailwindcss postcss autoprefixer @types/node

# Initialize Tailwind
npx tailwindcss init -p
```

## Directory Structure

```
src/
├── pages/                    # Page components
│   ├── Home.tsx
│   ├── Scan.tsx
│   ├── DeviceDetail.tsx
│   ├── Login.tsx
│   └── admin/
│       ├── Dashboard.tsx
│       ├── DeviceList.tsx
│       └── CreateDevice.tsx
├── components/               # Reusable components
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Loading.tsx
│   │   └── Toast.tsx
│   ├── passport/
│   │   ├── QRScanner.tsx
│   │   ├── PassportCard.tsx
│   │   ├── StatusBadge.tsx
│   │   └── Timeline.tsx
│   └── layout/
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       └── Layout.tsx
├── hooks/                    # Custom hooks
│   ├── useAuth.ts
│   ├── useDevice.ts
│   ├── usePermission.ts
│   └── useToast.ts
├── services/                 # API services
│   ├── api.ts
│   ├── auth.service.ts
│   ├── passport.service.ts
│   └── service-order.service.ts
├── store/                    # Zustand stores
│   ├── authStore.ts
│   └── uiStore.ts
├── types/                    # TypeScript types
│   ├── passport.ts
│   ├── user.ts
│   └── api.ts
├── utils/                    # Utilities
│   ├── passport-code.ts
│   ├── permission.ts
│   ├── format.ts
│   └── constants.ts
├── styles/
│   └── globals.css
├── App.tsx
└── main.tsx
```

## Type Definitions

```typescript
// types/passport.ts

export enum DeviceStatus {
  CREATED = 'CREATED',
  PROCURED = 'PROCURED',
  IN_QC = 'IN_QC',
  QC_PASSED = 'QC_PASSED',
  QC_FAILED = 'QC_FAILED',
  IN_ASSEMBLY = 'IN_ASSEMBLY',
  IN_TESTING = 'IN_TESTING',
  TEST_PASSED = 'TEST_PASSED',
  PACKAGED = 'PACKAGED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  IN_SERVICE = 'IN_SERVICE',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

export enum ProductLine {
  PLC = 'PLC',
  MOT = 'MOT',
  SEN = 'SEN',
  CTL = 'CTL',
  ROB = 'ROB',
  HMI = 'HMI',
  INV = 'INV',
  VLV = 'VLV',
  PCB = 'PCB',
  OTH = 'OTH',
}

export interface DevicePassport {
  id: string;
  passportCode: string;
  deviceName: string;
  deviceModel: string;
  productLine: ProductLine;
  originCountry: string;
  manufacturerId?: string;
  manufacturerName?: string;
  specifications?: Record<string, any>;
  description?: string;
  warrantyMonths: number;
  currentStatus: DeviceStatus;
  currentOwnerId?: string;
  blockchainHash?: string;
  createdAt: string;
  updatedAt: string;
  lifecycleEvents?: LifecycleEvent[];
  serviceOrders?: ServiceOrder[];
}

export interface LifecycleEvent {
  id: string;
  deviceId: string;
  eventStage: DeviceStatus;
  eventDate: string;
  operatorId?: string;
  operatorName?: string;
  operatorRole?: string;
  note?: string;
  attachments?: Attachment[];
}

export interface Attachment {
  type: 'image' | 'document' | 'video';
  url: string;
  name: string;
}

export interface ServiceOrder {
  id: string;
  orderNumber: string;
  deviceId: string;
  serviceType: ServiceType;
  status: OrderStatus;
  problem: string;
  engineer?: string;
  resolution?: string;
  createdAt: string;
}

export type ServiceType = 'REPAIR' | 'MAINTENANCE' | 'CONSULTATION' | 'EMERGENCY';
export type OrderStatus = 'CREATED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED';

// types/user.ts

export enum UserRole {
  PUBLIC = 'PUBLIC',
  CUSTOMER = 'CUSTOMER',
  SUPPLIER = 'SUPPLIER',
  QC_INSPECTOR = 'QC_INSPECTOR',
  ASSEMBLER = 'ASSEMBLER',
  TESTER = 'TESTER',
  PACKAGER = 'PACKAGER',
  LOGISTICS = 'LOGISTICS',
  ENGINEER = 'ENGINEER',
  OPERATOR = 'OPERATOR',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
  role: UserRole;
  organizationName?: string;
  isActive: boolean;
}

// types/api.ts

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## API Service

```typescript
// services/api.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use((config) => {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    return response.data;
  }
}

export const api = new ApiClient();

// services/passport.service.ts

import { api } from './api';
import { ApiResponse, PaginatedResponse } from '../types/api';
import { DevicePassport, DeviceStatus, LifecycleEvent } from '../types/passport';

export interface CreatePassportDto {
  deviceName: string;
  deviceModel: string;
  productLine: string;
  originCountry: string;
  manufacturerName?: string;
  specifications?: Record<string, any>;
  description?: string;
  warrantyMonths?: number;
}

export interface UpdateStatusDto {
  status: DeviceStatus;
  note?: string;
  attachments?: { type: string; url: string; name: string }[];
}

export interface QueryParams {
  status?: DeviceStatus;
  productLine?: string;
  page?: number;
  limit?: number;
}

export const passportService = {
  // Public - scan device
  async scan(code: string): Promise<ApiResponse<Partial<DevicePassport>>> {
    return api.get(`/api/v1/scan/${code}`);
  },

  // Create passport
  async create(data: CreatePassportDto): Promise<ApiResponse<DevicePassport>> {
    return api.post('/api/v1/passports', data);
  },

  // List passports
  async list(params?: QueryParams): Promise<PaginatedResponse<DevicePassport>> {
    return api.get('/api/v1/passports', params);
  },

  // Get passport by ID
  async getById(id: string): Promise<ApiResponse<DevicePassport>> {
    return api.get(`/api/v1/passports/${id}`);
  },

  // Update status
  async updateStatus(id: string, data: UpdateStatusDto): Promise<ApiResponse<DevicePassport>> {
    return api.patch(`/api/v1/passports/${id}/status`, data);
  },

  // Get lifecycle events
  async getLifecycle(id: string): Promise<ApiResponse<LifecycleEvent[]>> {
    return api.get(`/api/v1/passports/${id}/lifecycle`);
  },
};
```

## Auth Store (Zustand)

```typescript
// store/authStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/user';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<{ token: string; user: User }>(
            '/api/v1/auth/login',
            { username, password }
          );
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
```

## React Query Hooks

```typescript
// hooks/useDevice.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { passportService, CreatePassportDto, UpdateStatusDto, QueryParams } from '../services/passport.service';
import { useToast } from './useToast';

// List devices
export function useDevices(params?: QueryParams) {
  return useQuery({
    queryKey: ['devices', params],
    queryFn: () => passportService.list(params),
  });
}

// Get single device
export function useDevice(id: string) {
  return useQuery({
    queryKey: ['device', id],
    queryFn: () => passportService.getById(id),
    enabled: !!id,
  });
}

// Scan device (public)
export function useScanDevice(code: string) {
  return useQuery({
    queryKey: ['scan', code],
    queryFn: () => passportService.scan(code),
    enabled: !!code,
  });
}

// Create device
export function useCreateDevice() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: CreatePassportDto) => passportService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      showSuccess(`设备创建成功: ${response.data.passportCode}`);
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || '创建失败');
    },
  });
}

// Update status
export function useUpdateStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStatusDto }) =>
      passportService.updateStatus(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['device', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      showSuccess('状态更新成功');
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || '更新失败');
    },
  });
}
```

## Permission Hook

```typescript
// hooks/usePermission.ts

import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types/user';

const ACTION_PERMISSIONS: Record<string, UserRole[]> = {
  CREATE_DEVICE: [UserRole.ADMIN, UserRole.OPERATOR],
  UPDATE_STATUS: [
    UserRole.ADMIN, UserRole.OPERATOR, UserRole.QC_INSPECTOR,
    UserRole.ASSEMBLER, UserRole.TESTER, UserRole.PACKAGER, UserRole.LOGISTICS,
  ],
  CREATE_SERVICE_ORDER: [
    UserRole.ADMIN, UserRole.OPERATOR, UserRole.CUSTOMER, UserRole.ENGINEER,
  ],
  EXECUTE_SERVICE: [UserRole.ADMIN, UserRole.ENGINEER],
  VIEW_COST: [UserRole.ADMIN, UserRole.OPERATOR],
  VIEW_ADMIN: [UserRole.ADMIN, UserRole.OPERATOR],
};

export function usePermission() {
  const { user, isAuthenticated } = useAuthStore();

  const hasPermission = (action: string): boolean => {
    if (!isAuthenticated || !user) return false;
    const allowedRoles = ACTION_PERMISSIONS[action] || [];
    return allowedRoles.includes(user.role as UserRole);
  };

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!isAuthenticated || !user) return false;
    return roles.includes(user.role as UserRole);
  };

  const isAdmin = (): boolean => {
    return hasRole(UserRole.ADMIN);
  };

  return {
    user,
    isAuthenticated,
    hasPermission,
    hasRole,
    isAdmin,
  };
}
```

## Component Templates

```tsx
// components/passport/StatusBadge.tsx

import { DeviceStatus } from '../../types/passport';

const STATUS_CONFIG: Record<DeviceStatus, { label: string; color: string; bgColor: string }> = {
  [DeviceStatus.CREATED]: { label: '已创建', color: '#6b7280', bgColor: '#f3f4f6' },
  [DeviceStatus.PROCURED]: { label: '已采购', color: '#3b82f6', bgColor: '#dbeafe' },
  [DeviceStatus.IN_QC]: { label: '质检中', color: '#f59e0b', bgColor: '#fef3c7' },
  [DeviceStatus.QC_PASSED]: { label: '质检通过', color: '#10b981', bgColor: '#d1fae5' },
  [DeviceStatus.QC_FAILED]: { label: '质检不通过', color: '#ef4444', bgColor: '#fee2e2' },
  [DeviceStatus.IN_ASSEMBLY]: { label: '装配中', color: '#8b5cf6', bgColor: '#ede9fe' },
  [DeviceStatus.IN_TESTING]: { label: '测试中', color: '#f59e0b', bgColor: '#fef3c7' },
  [DeviceStatus.TEST_PASSED]: { label: '测试通过', color: '#10b981', bgColor: '#d1fae5' },
  [DeviceStatus.PACKAGED]: { label: '已打包', color: '#6366f1', bgColor: '#e0e7ff' },
  [DeviceStatus.IN_TRANSIT]: { label: '运输中', color: '#0ea5e9', bgColor: '#e0f2fe' },
  [DeviceStatus.DELIVERED]: { label: '已交付', color: '#10b981', bgColor: '#d1fae5' },
  [DeviceStatus.IN_SERVICE]: { label: '服务中', color: '#f59e0b', bgColor: '#fef3c7' },
  [DeviceStatus.DECOMMISSIONED]: { label: '已报废', color: '#6b7280', bgColor: '#f3f4f6' },
};

interface Props {
  status: DeviceStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: Props) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG[DeviceStatus.CREATED];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]}`}
      style={{ color: config.color, backgroundColor: config.bgColor }}
    >
      {config.label}
    </span>
  );
}

// components/passport/Timeline.tsx

import { LifecycleEvent, DeviceStatus } from '../../types/passport';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Props {
  events: LifecycleEvent[];
}

export function Timeline({ events }: Props) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
  );

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {sortedEvents.map((event, idx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {idx !== sortedEvents.length - 1 && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-900 font-medium">
                      {STATUS_CONFIG[event.eventStage as DeviceStatus]?.label || event.eventStage}
                    </p>
                    {event.note && (
                      <p className="mt-1 text-sm text-gray-500">{event.note}</p>
                    )}
                    {event.operatorName && (
                      <p className="mt-1 text-xs text-gray-400">
                        操作员: {event.operatorName}
                      </p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    {format(new Date(event.eventDate), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// components/common/Modal.tsx

import { Fragment, ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ isOpen, onClose, title, children, size = 'md' }: Props) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className={`relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full ${sizeClasses[size]} sm:p-6`}>
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div>
                  <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                    {title}
                  </Dialog.Title>
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
```

## Page Templates

```tsx
// pages/Scan.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScanDevice } from '../hooks/useDevice';
import { QrCodeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function ScanPage() {
  const [code, setCode] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const navigate = useNavigate();
  
  const { data, isLoading, error } = useScanDevice(searchCode);

  const handleSearch = () => {
    if (code.trim()) {
      setSearchCode(code.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <QrCodeIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">扫码查询</h1>
          <p className="text-gray-500 mt-2">扫描设备二维码或输入设备护照码</p>
        </div>

        {/* Search Input */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="relative">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入设备码，如: DP-MED-2025-PLC-DE-000001-A7"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading || !code.trim()}
            className="w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>查询中...</span>
            ) : (
              <>
                <MagnifyingGlassIcon className="w-5 h-5" />
                <span>查询设备</span>
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm">未找到该设备，请检查设备码是否正确</p>
          </div>
        )}

        {/* Result */}
        {data?.data && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-semibold text-lg text-gray-900">{data.data.deviceName}</h2>
              <p className="text-gray-500 text-sm mt-1">{data.data.passportCode}</p>
            </div>
            <div className="p-6 space-y-4">
              <InfoRow label="型号" value={data.data.deviceModel} />
              <InfoRow label="制造商" value={data.data.manufacturerName} />
              <InfoRow label="产品线" value={data.data.productLine} />
              <InfoRow label="原产地" value={data.data.originCountry} />
              <InfoRow label="状态" value={data.data.currentStatus} />
            </div>
            <div className="p-6 bg-gray-50 flex gap-3">
              <button
                onClick={() => navigate(`/device/${searchCode}`)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                查看详情
              </button>
              <button
                onClick={() => navigate(`/service/request?device=${searchCode}`)}
                className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600"
              >
                报修申请
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium">{value || '-'}</span>
    </div>
  );
}
```

## Protected Route Component

```tsx
// components/auth/ProtectedRoute.tsx

import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/user';

interface Props {
  children: React.ReactNode;
  roles?: UserRole[];
}

export function ProtectedRoute({ children, roles }: Props) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.role as UserRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
```

## App Router Setup

```tsx
// App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { UserRole } from './types/user';

// Pages
import Home from './pages/Home';
import Scan from './pages/Scan';
import DeviceDetail from './pages/DeviceDetail';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import DeviceList from './pages/admin/DeviceList';
import CreateDevice from './pages/admin/CreateDevice';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/device/:code" element={<DeviceDetail />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={[UserRole.ADMIN, UserRole.OPERATOR]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="devices" element={<DeviceList />} />
            <Route path="devices/create" element={<CreateDevice />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

## Environment Variables

```bash
# .env.development
VITE_API_URL=http://localhost:3000

# .env.production
VITE_API_URL=https://api.yourcompany.com
```
