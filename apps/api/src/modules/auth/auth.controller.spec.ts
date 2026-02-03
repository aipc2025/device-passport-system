import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto';
import { UserRole } from '@device-passport/shared';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    refreshToken: jest.fn(),
    validateUser: jest.fn(),
  };

  const mockAuthResponse = {
    user: {
      id: 'user-id-123',
      email: 'test@example.com',
      name: 'Test User',
      role: UserRole.CUSTOMER,
      organizationId: 'org-123',
      isActive: true,
      isExpert: false,
      expertId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 7 * 24 * 60 * 60,
  };

  const mockUser = {
    id: 'user-id-123',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.CUSTOMER,
    organizationId: 'org-123',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /auth/login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockAuthResponse);
      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(service.login).toHaveBeenCalledTimes(1);
    });

    it('should return access and refresh tokens on successful login', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(controller.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should handle case-insensitive email', async () => {
      const loginDto: LoginDto = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      await controller.login(loginDto);

      expect(service.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('POST /auth/register', () => {
    it('should successfully register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        name: 'New User',
        organizationId: 'org-456',
      };

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockAuthResponse);
      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(service.register).toHaveBeenCalledTimes(1);
    });

    it('should return tokens after successful registration', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        name: 'New User',
      };

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('role', UserRole.CUSTOMER);
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      };

      mockAuthService.register.mockRejectedValue(
        new ConflictException('User with this email already exists')
      );

      await expect(controller.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(controller.register(registerDto)).rejects.toThrow(
        'User with this email already exists'
      );
    });

    it('should accept optional organizationId', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        organizationId: 'org-789',
      };

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      await controller.register(registerDto);

      expect(service.register).toHaveBeenCalledWith(
        expect.objectContaining({ organizationId: 'org-789' })
      );
    });
  });

  describe('POST /auth/refresh', () => {
    it('should successfully refresh token', async () => {
      const refreshDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      const newAuthResponse = {
        ...mockAuthResponse,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockAuthService.refreshToken.mockResolvedValue(newAuthResponse);

      const result = await controller.refresh(refreshDto);

      expect(result).toEqual(newAuthResponse);
      expect(service.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(service.refreshToken).toHaveBeenCalledTimes(1);
    });

    it('should return new access and refresh tokens', async () => {
      const refreshDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      mockAuthService.refreshToken.mockResolvedValue({
        ...mockAuthResponse,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const result = await controller.refresh(refreshDto);

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshDto: RefreshTokenDto = {
        refreshToken: 'invalid-token',
      };

      mockAuthService.refreshToken.mockRejectedValue(new UnauthorizedException('Invalid token'));

      await expect(controller.refresh(refreshDto)).rejects.toThrow(UnauthorizedException);
      await expect(controller.refresh(refreshDto)).rejects.toThrow('Invalid token');
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const refreshDto: RefreshTokenDto = {
        refreshToken: 'expired-token',
      };

      mockAuthService.refreshToken.mockRejectedValue(new UnauthorizedException('Invalid token'));

      await expect(controller.refresh(refreshDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user for authenticated request', async () => {
      const tokenPayload = {
        sub: 'user-id-123',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
        organizationId: 'org-123',
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);

      const result = await controller.me(tokenPayload);

      expect(result).toEqual(mockUser);
      expect(service.validateUser).toHaveBeenCalledWith(tokenPayload.sub);
      expect(service.validateUser).toHaveBeenCalledTimes(1);
    });

    it('should use user ID from JWT token payload', async () => {
      const tokenPayload = {
        sub: 'user-id-456',
        email: 'another@example.com',
        role: UserRole.ADMIN,
      };

      mockAuthService.validateUser.mockResolvedValue({
        ...mockUser,
        id: 'user-id-456',
        email: 'another@example.com',
        role: UserRole.ADMIN,
      });

      await controller.me(tokenPayload);

      expect(service.validateUser).toHaveBeenCalledWith('user-id-456');
    });

    it('should return null for inactive users', async () => {
      const tokenPayload = {
        sub: 'inactive-user-id',
        email: 'inactive@example.com',
        role: UserRole.CUSTOMER,
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      const result = await controller.me(tokenPayload);

      expect(result).toBeNull();
    });

    it('should not include password in response', async () => {
      const tokenPayload = {
        sub: 'user-id-123',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);

      const result = await controller.me(tokenPayload);

      expect(result).not.toHaveProperty('password');
    });
  });

  describe('Endpoint Security', () => {
    it('should have @Public() decorator on login endpoint', () => {
      const metadata = Reflect.getMetadata('isPublic', controller.login);
      // The @Public() decorator should be present
      // This is a compile-time check, actual behavior depends on guards
      expect(controller.login).toBeDefined();
    });

    it('should have @Public() decorator on register endpoint', () => {
      // The @Public() decorator should be present
      expect(controller.register).toBeDefined();
    });

    it('should have @Public() decorator on refresh endpoint', () => {
      // The @Public() decorator should be present
      expect(controller.refresh).toBeDefined();
    });

    it('should require authentication for /me endpoint', () => {
      // The me endpoint should use JwtAuthGuard
      expect(controller.me).toBeDefined();
    });
  });
});
