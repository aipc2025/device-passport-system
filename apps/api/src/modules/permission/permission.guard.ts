import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from './permission.service';

/**
 * Key for permission metadata set by @RequirePermission decorator
 */
export const PERMISSION_KEY = 'permissions';

/**
 * Permission Guard
 *
 * Checks if the authenticated user has the required permissions to access a route.
 * Use with @RequirePermission() decorator.
 *
 * Example:
 * @RequirePermission('device.create', 'device.update')
 * @Post()
 * createDevice() { ... }
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required permissions from metadata
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Get user from request (set by JWT strategy)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Get user permissions
    const userPerms = await this.permissionService.getUserPermissions(user.userId);

    if (!userPerms) {
      throw new ForbiddenException('User permissions not found');
    }

    // Check if user has all required permissions
    for (const required of requiredPermissions) {
      const hasPermission = this.hasPermission(userPerms.permissions, required);

      if (!hasPermission) {
        throw new ForbiddenException(`Missing required permission: ${required}`);
      }
    }

    // Attach user permissions to request for use in controllers/services
    request.userPermissions = userPerms;

    return true;
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
}
