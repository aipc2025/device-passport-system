import { SetMetadata } from '@nestjs/common';
import { PERMISSION_KEY } from './permission.guard';

/**
 * Require Permission Decorator
 *
 * Marks a route as requiring specific permissions.
 * Works with PermissionGuard to enforce permission checks.
 *
 * @param permissions - One or more permission strings (e.g., 'device.create', 'qc.approve')
 *
 * @example
 * @RequirePermission('device.create')
 * @Post()
 * createDevice() { ... }
 *
 * @example
 * @RequirePermission('device.update', 'device.delete')
 * @Patch(':id')
 * updateDevice() { ... }
 */
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(PERMISSION_KEY, permissions);

/**
 * Get Current User Permissions Decorator
 *
 * Extracts user permissions from request (injected by PermissionGuard)
 * and injects them into the route handler parameter.
 *
 * @example
 * @Get()
 * @UseGuards(JwtAuthGuard, PermissionGuard)
 * async findAll(@CurrentUserPermissions() userPerms: UserPermissions) {
 *   // userPerms contains full permission metadata
 * }
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserPermissions = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.userPermissions;
  },
);
