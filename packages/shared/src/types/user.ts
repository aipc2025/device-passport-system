import { UserRole, DataScope, PermissionAction, PermissionResource, ProductLine } from '../enums';

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
  isExpert?: boolean; // True if user is an individual expert
  expertId?: string; // ID of the IndividualExpert record
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
  isExpert?: boolean;
  expertId?: string;
  scopeConfig?: ScopeConfig; // Permission metadata
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

/**
 * Permission scope configuration stored in User entity scopeConfig field
 * This is a JSONB field for flexible permission metadata
 */
export interface ScopeConfig {
  dataScope?: DataScope;           // Data access scope (ALL, DEPARTMENT, OWN)
  productLines?: ProductLine[];    // Limited product lines (e.g., only PLC)
  departments?: string[];          // Department IDs (future use)
  canApprove?: boolean;            // Can approve workflows
  maxAmount?: number;              // Maximum transaction amount (future use)
  customPermissions?: string[];    // Custom permission strings
}

/**
 * User permission metadata with computed permissions
 * Used by PermissionService and PermissionGuard
 */
export interface UserPermissions {
  userId: string;
  role: UserRole;
  organizationId?: string;
  dataScope: DataScope;
  scopeConfig: ScopeConfig;
  permissions: string[];           // Array of permission strings (e.g., 'device.create', 'qc.approve')
}

/**
 * Permission definition for a specific action on a resource
 */
export interface Permission {
  resource: PermissionResource;
  action: PermissionAction;
  toString(): string;              // Returns 'resource.action' format
}

/**
 * Role-based permission mapping
 * Defines what permissions each role has
 */
export interface RolePermissions {
  role: UserRole;
  permissions: string[];           // Array of permission strings
  dataScope: DataScope;
  description: string;
}
