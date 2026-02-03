import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, ROLE_PERMISSION_LEVELS } from '@device-passport/shared';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    // Check if user's role has sufficient permission level
    const userLevel = ROLE_PERMISSION_LEVELS[user.role as UserRole] || 0;
    const minRequiredLevel = Math.min(
      ...requiredRoles.map((role) => ROLE_PERMISSION_LEVELS[role] || 0)
    );

    return userLevel >= minRequiredLevel;
  }
}
