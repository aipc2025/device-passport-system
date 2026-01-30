import { UserRole } from '../enums';

/**
 * User base interface
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Organization/Company interface
 */
export interface Organization {
  id: string;
  name: string;
  code: string; // 3-letter company code for passport generation
  type: OrganizationType;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Organization types
 */
export enum OrganizationType {
  INTERNAL = 'INTERNAL', // Our company
  SUPPLIER = 'SUPPLIER', // Device suppliers
  CUSTOMER = 'CUSTOMER', // End customers
  SERVICE_PARTNER = 'SERVICE_PARTNER', // Service partners
}

/**
 * Login DTO
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Register DTO
 */
export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  organizationId?: string;
}

/**
 * Auth response
 */
export interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Token payload
 */
export interface TokenPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  organizationId?: string;
  iat?: number;
  exp?: number;
}

/**
 * Create user DTO (admin)
 */
export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  organizationId?: string;
}

/**
 * Update user DTO
 */
export interface UpdateUserDto {
  name?: string;
  role?: UserRole;
  organizationId?: string;
  isActive?: boolean;
}

/**
 * Create organization DTO
 */
export interface CreateOrganizationDto {
  name: string;
  code: string;
  type: OrganizationType;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
}

/**
 * Update organization DTO
 */
export interface UpdateOrganizationDto {
  name?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive?: boolean;
}
