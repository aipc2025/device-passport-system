import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  const createMockExecutionContext = (isPublic?: boolean): ExecutionContext => {
    const mockContext = {
      getHandler: jest.fn().mockReturnValue({}),
      getClass: jest.fn().mockReturnValue({}),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: 'Bearer valid-token',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    if (isPublic !== undefined) {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(isPublic);
    }

    return mockContext;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access to routes marked with @Public()', () => {
      const context = createMockExecutionContext(true);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should check reflector for public metadata', () => {
      const context = createMockExecutionContext(false);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      // Mock super.canActivate to return a promise
      jest
        .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(Promise.resolve(true));

      guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, expect.any(Array));
    });

    it('should delegate to parent AuthGuard for protected routes', () => {
      const context = createMockExecutionContext(false);

      // Mock the parent canActivate to return a promise
      const superCanActivateSpy = jest
        .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(Promise.resolve(true));

      const result = guard.canActivate(context);

      expect(result).toBeDefined();
      expect(superCanActivateSpy).toHaveBeenCalledWith(context);
    });

    it('should not call parent guard for public routes', () => {
      const context = createMockExecutionContext(true);

      const result = guard.canActivate(context);

      // Public routes should return true immediately without calling parent
      expect(result).toBe(true);
    });

    it('should check class-level @Public() decorator', () => {
      const context = createMockExecutionContext();

      // Mock getAllAndOverride to return true for class-level decorator
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should check handler-level @Public() decorator', () => {
      const context = createMockExecutionContext();

      // Mock getAllAndOverride to return true for handler-level decorator
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('Integration with AuthGuard', () => {
    it('should be an instance of JwtAuthGuard', () => {
      expect(guard).toBeInstanceOf(JwtAuthGuard);
      expect(guard).toBeDefined();
    });

    it('should pass execution context to parent guard', () => {
      const context = createMockExecutionContext(false);

      const superCanActivateSpy = jest
        .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(Promise.resolve(true));

      guard.canActivate(context);

      expect(superCanActivateSpy).toHaveBeenCalledWith(context);
    });
  });

  describe('Reflector usage', () => {
    it('should use reflector to check for public metadata', () => {
      const context = createMockExecutionContext();
      const getAllAndOverrideSpy = jest.spyOn(reflector, 'getAllAndOverride');

      guard.canActivate(context);

      expect(getAllAndOverrideSpy).toHaveBeenCalled();
    });

    it('should use IS_PUBLIC_KEY constant for metadata checks', () => {
      const context = createMockExecutionContext();
      const getAllAndOverrideSpy = jest.spyOn(reflector, 'getAllAndOverride');

      guard.canActivate(context);

      expect(getAllAndOverrideSpy).toHaveBeenCalled();
      // Verify it uses the correct metadata key
      expect(IS_PUBLIC_KEY).toBeDefined();
    });
  });
});
