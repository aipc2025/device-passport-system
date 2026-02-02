import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  UserRole,
  DataScope,
  UserPermissions,
  ScopeConfig,
  ProductLine,
} from '@device-passport/shared';
import { User } from '../../database/entities';

/**
 * Permission Service
 *
 * Handles RBAC permission checks and data scope filtering for multi-tenant system.
 * Supports organization-level data isolation and role-based permissions.
 */
@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  // Role-based permission definitions
  private readonly rolePermissions: Record<UserRole, string[]> = {
    // Public - minimal permissions
    [UserRole.PUBLIC]: ['scan.read'],

    // Customer - view own data
    [UserRole.CUSTOMER]: [
      'scan.read',
      'device.read',
      'service-request.create',
      'service-request.read',
    ],

    // Engineer - execute services
    [UserRole.ENGINEER]: [
      'scan.read',
      'device.read',
      'device.update',
      'service-order.read',
      'service-order.update',
      'service-record.create',
    ],

    // QC Inspector - quality control
    [UserRole.QC_INSPECTOR]: [
      'scan.read',
      'device.read',
      'device.update',
      'qc.read',
      'qc.approve',
      'device.status.update',
    ],

    // Operator - create and manage devices
    [UserRole.OPERATOR]: [
      'scan.read',
      'device.*',  // All device operations
      'passport.*',  // All passport operations
      'service-order.read',
      'service-order.update',
      'user.read',
    ],

    // Admin - full platform access
    [UserRole.ADMIN]: ['*'],  // All permissions

    // Supplier Viewer - read-only access to own org
    [UserRole.SUPPLIER_VIEWER]: [
      'scan.read',
      'device.read',
      'passport.read',
    ],

    // Supplier QC - quality control at supplier
    [UserRole.SUPPLIER_QC]: [
      'scan.read',
      'device.read',
      'device.update',
      'qc.read',
      'qc.create',
      'qc.approve',
      'device.status.update',
    ],

    // Supplier Packer - packaging at supplier
    [UserRole.SUPPLIER_PACKER]: [
      'scan.read',
      'device.read',
      'device.update',
      'package.read',
      'package.create',
      'package.approve',
      'device.status.update',
    ],

    // Supplier Shipper - shipping at supplier
    [UserRole.SUPPLIER_SHIPPER]: [
      'scan.read',
      'device.read',
      'device.update',
      'shipping.read',
      'shipping.create',
      'shipping.update',
      'device.status.update',
    ],

    // Supplier Admin - manage supplier org
    [UserRole.SUPPLIER_ADMIN]: [
      'scan.read',
      'device.*',
      'passport.*',
      'qc.*',
      'package.*',
      'shipping.*',
      'user.read',
      'user.create',
      'user.update',
    ],
  };

  // Default data scope for each role
  private readonly roleDataScope: Record<UserRole, DataScope> = {
    [UserRole.PUBLIC]: DataScope.OWN,
    [UserRole.CUSTOMER]: DataScope.OWN,
    [UserRole.ENGINEER]: DataScope.ALL,
    [UserRole.QC_INSPECTOR]: DataScope.ALL,
    [UserRole.OPERATOR]: DataScope.ALL,
    [UserRole.ADMIN]: DataScope.ALL,
    [UserRole.SUPPLIER_VIEWER]: DataScope.ALL,  // All within org
    [UserRole.SUPPLIER_QC]: DataScope.ALL,  // All within org
    [UserRole.SUPPLIER_PACKER]: DataScope.ALL,  // All within org
    [UserRole.SUPPLIER_SHIPPER]: DataScope.ALL,  // All within org
    [UserRole.SUPPLIER_ADMIN]: DataScope.ALL,  // All within org
  };

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Get user permissions with computed permission strings
   */
  async getUserPermissions(userId: string): Promise<UserPermissions | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      return null;
    }

    // Get base permissions for role
    const permissions = this.rolePermissions[user.role] || [];

    // Get data scope (from scopeConfig or default)
    const dataScope = user.scopeConfig?.dataScope || this.roleDataScope[user.role];

    // Merge scopeConfig
    const scopeConfig: ScopeConfig = {
      dataScope,
      ...user.scopeConfig,
    };

    return {
      userId: user.id,
      role: user.role,
      organizationId: user.organizationId,
      dataScope,
      scopeConfig,
      permissions,
    };
  }

  /**
   * Check if user has a specific permission
   */
  async checkPermission(
    userId: string,
    requiredPermission: string,
  ): Promise<boolean> {
    const userPerms = await this.getUserPermissions(userId);

    if (!userPerms) {
      return false;
    }

    return this.hasPermission(userPerms.permissions, requiredPermission);
  }

  /**
   * Check if permission array contains required permission
   * Supports wildcard matching (device.* matches device.create)
   */
  private hasPermission(permissions: string[], required: string): boolean {
    // Check for global wildcard
    if (permissions.includes('*')) {
      return true;
    }

    // Check for exact match
    if (permissions.includes(required)) {
      return true;
    }

    // Check for wildcard match (device.* matches device.create)
    const [resource] = required.split('.');
    if (permissions.includes(`${resource}.*`)) {
      return true;
    }

    return false;
  }

  /**
   * Apply data scope filtering to a query builder
   * Ensures organization-level data isolation and scope-based filtering
   */
  applyDataScope<T>(
    qb: SelectQueryBuilder<T>,
    userPerms: UserPermissions,
    alias: string,
  ): SelectQueryBuilder<T> {
    // Admin has access to all data
    if (userPerms.role === UserRole.ADMIN) {
      return qb;
    }

    // Organization isolation - users can only see their org's data
    if (userPerms.organizationId) {
      qb.andWhere(`${alias}.organizationId = :orgId`, {
        orgId: userPerms.organizationId,
      });
    }

    // Data scope filtering
    if (userPerms.dataScope === DataScope.OWN) {
      // Only own created data
      qb.andWhere(`${alias}.createdById = :userId`, {
        userId: userPerms.userId,
      });
    }
    // DataScope.ALL and DataScope.DEPARTMENT don't add extra filters
    // (organization filter already applied above)

    // Product line filtering (e.g., SUPPLIER_QC only sees PLC products)
    if (userPerms.scopeConfig.productLines?.length) {
      qb.andWhere(`${alias}.productLine IN (:...productLines)`, {
        productLines: userPerms.scopeConfig.productLines,
      });
    }

    // Department filtering (future use)
    if (userPerms.scopeConfig.departments?.length) {
      qb.andWhere(`${alias}.departmentId IN (:...departments)`, {
        departments: userPerms.scopeConfig.departments,
      });
    }

    return qb;
  }

  /**
   * Check if user can approve workflows
   */
  async canApprove(userId: string): Promise<boolean> {
    const userPerms = await this.getUserPermissions(userId);
    if (!userPerms) {
      return false;
    }

    // Check scopeConfig canApprove flag
    if (userPerms.scopeConfig.canApprove === false) {
      return false;
    }

    // Check if user has approve permission
    return (
      this.hasPermission(userPerms.permissions, 'qc.approve') ||
      this.hasPermission(userPerms.permissions, 'package.approve') ||
      this.hasPermission(userPerms.permissions, 'shipping.approve')
    );
  }

  /**
   * Get allowed product lines for user
   */
  async getAllowedProductLines(userId: string): Promise<ProductLine[] | null> {
    const userPerms = await this.getUserPermissions(userId);
    if (!userPerms) {
      return null;
    }

    // If productLines restriction exists, return it
    if (userPerms.scopeConfig.productLines?.length) {
      return userPerms.scopeConfig.productLines;
    }

    // Otherwise, user has access to all product lines
    return null;
  }
}
