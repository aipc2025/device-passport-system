import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User, IndividualExpert } from '../../database/entities';
import { UserRole } from '@device-passport/shared';

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let expertRepository: Repository<IndividualExpert>;
  let jwtService: JwtService;

  const mockUser = {
    id: 'user-id-123',
    email: 'test@example.com',
    password: '$2b$10$hashedPassword',
    name: 'Test User',
    role: UserRole.CUSTOMER,
    organizationId: 'org-123',
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockExpert = {
    id: 'expert-id-123',
    userId: 'user-id-123',
    personalName: 'Expert User',
    expertTypes: ['TECHNICAL'],
    phone: '+86-138-0000-0000',
    registrationStatus: 'APPROVED',
    isAvailable: true,
  };

  let queryBuilder: any;

  const mockUserRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockExpertRepository = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(IndividualExpert),
          useValue: mockExpertRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    expertRepository = module.get<Repository<IndividualExpert>>(
      getRepositoryToken(IndividualExpert)
    );
    jwtService = module.get<JwtService>(JwtService);

    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup query builder mock for each test
    queryBuilder = {
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };
    mockUserRepository.createQueryBuilder.mockReturnValue(queryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const queryBuilder = mockUserRepository.createQueryBuilder();
      queryBuilder.getOne.mockResolvedValue(mockUser);
      mockExpertRepository.findOne.mockResolvedValue(null);
      mockJwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({ lastLoginAt: expect.any(Date) })
      );
    });

    it('should login user with expert profile', async () => {
      const loginDto = {
        email: 'expert@example.com',
        password: 'password123',
      };

      const queryBuilder = mockUserRepository.createQueryBuilder();
      queryBuilder.getOne.mockResolvedValue(mockUser);
      mockExpertRepository.findOne.mockResolvedValue(mockExpert);
      mockJwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result.user).toHaveProperty('isExpert', true);
      expect(result.user).toHaveProperty('expertId', mockExpert.id);
    });

    it('should normalize email to lowercase during login', async () => {
      const loginDto = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      };

      const queryBuilder = mockUserRepository.createQueryBuilder();
      queryBuilder.getOne.mockResolvedValue(mockUser);
      mockExpertRepository.findOne.mockResolvedValue(null);
      mockJwtService.sign.mockReturnValue('token');

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login(loginDto);

      expect(queryBuilder.where).toHaveBeenCalledWith('user.email = :email', {
        email: 'test@example.com',
      });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const queryBuilder = mockUserRepository.createQueryBuilder();
      queryBuilder.getOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const inactiveUser = { ...mockUser, isActive: false };
      const queryBuilder = mockUserRepository.createQueryBuilder();
      queryBuilder.getOne.mockResolvedValue(inactiveUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const queryBuilder = mockUserRepository.createQueryBuilder();
      queryBuilder.getOne.mockResolvedValue(mockUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should update lastLoginAt timestamp on successful login', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const queryBuilder = mockUserRepository.createQueryBuilder();
      queryBuilder.getOne.mockResolvedValue(mockUser);
      mockExpertRepository.findOne.mockResolvedValue(null);
      mockJwtService.sign.mockReturnValue('token');

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login(loginDto);

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({ lastLoginAt: expect.any(Date) })
      );
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        name: 'New User',
        organizationId: 'org-456',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        ...mockUser,
        email: registerDto.email,
        name: registerDto.name,
      });
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        email: registerDto.email,
        name: registerDto.name,
      });
      mockExpertRepository.findOne.mockResolvedValue(null);
      mockJwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedPassword');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: expect.any(String),
        name: registerDto.name,
        role: UserRole.CUSTOMER,
        organizationId: registerDto.organizationId,
      });
    });

    it('should normalize email to lowercase during registration', async () => {
      const registerDto = {
        email: 'NEWUSER@EXAMPLE.COM',
        password: 'SecurePassword123!',
        name: 'New User',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockExpertRepository.findOne.mockResolvedValue(null);
      mockJwtService.sign.mockReturnValue('token');

      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedPassword');

      await service.register(registerDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'newuser@example.com' },
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'newuser@example.com' })
      );
    });

    it('should hash password before saving', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'PlainTextPassword',
        name: 'New User',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockExpertRepository.findOne.mockResolvedValue(null);
      mockJwtService.sign.mockReturnValue('token');

      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedPassword');

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('PlainTextPassword', 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: '$2b$10$hashedPassword' })
      );
    });

    it('should assign CUSTOMER role by default', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockExpertRepository.findOne.mockResolvedValue(null);
      mockJwtService.sign.mockReturnValue('token');

      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedPassword');

      await service.register(registerDto);

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRole.CUSTOMER })
      );
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.register(registerDto)).rejects.toThrow(
        'User with this email already exists'
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token with valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = {
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        organizationId: mockUser.organizationId,
      };

      mockJwtService.verify.mockReturnValue(payload);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockExpertRepository.findOne.mockResolvedValue(null);
      mockJwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      const result = await service.refreshToken(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('password');
      expect(mockJwtService.verify).toHaveBeenCalledWith(refreshToken);
    });

    it('should include expert info in refreshed token if user is expert', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = {
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        organizationId: mockUser.organizationId,
      };

      mockJwtService.verify.mockReturnValue(payload);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockExpertRepository.findOne.mockResolvedValue(mockExpert);
      mockJwtService.sign.mockReturnValue('token');

      const result = await service.refreshToken(refreshToken);

      expect(result.user).toHaveProperty('isExpert', true);
      expect(result.user).toHaveProperty('expertId', mockExpert.id);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const refreshToken = 'invalid-token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshToken(refreshToken)).rejects.toThrow('Invalid token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = {
        sub: 'non-existent-user-id',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
      };

      mockJwtService.verify.mockReturnValue(payload);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshToken(refreshToken)).rejects.toThrow('Invalid token');
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = {
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      };

      const inactiveUser = { ...mockUser, isActive: false };
      mockJwtService.verify.mockReturnValue(payload);
      mockUserRepository.findOne.mockResolvedValue(inactiveUser);

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshToken(refreshToken)).rejects.toThrow('Invalid token');
    });
  });

  describe('validateUser', () => {
    it('should return user if found and active', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id, isActive: true },
      });
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser('non-existent-id');

      expect(result).toBeNull();
    });

    it('should not return inactive users', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser(mockUser.id);

      expect(result).toBeNull();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id, isActive: true },
      });
    });
  });

  describe('generateTokens (private method testing via public methods)', () => {
    it('should generate JWT tokens with correct expiry', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const queryBuilder = mockUserRepository.createQueryBuilder();
      queryBuilder.getOne.mockResolvedValue(mockUser);
      mockExpertRepository.findOne.mockResolvedValue(null);
      mockJwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login(loginDto);

      // First call is for access token (default expiry)
      expect(mockJwtService.sign).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        })
      );

      // Second call is for refresh token (30 days)
      expect(mockJwtService.sign).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        }),
        { expiresIn: '30d' }
      );
    });

    it('should include organizationId in token payload if present', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const queryBuilder = mockUserRepository.createQueryBuilder();
      queryBuilder.getOne.mockResolvedValue(mockUser);
      mockExpertRepository.findOne.mockResolvedValue(null);
      mockJwtService.sign.mockReturnValue('token');

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login(loginDto);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: mockUser.organizationId,
        }),
        expect.anything()
      );
    });

    it('should never include password in response', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const queryBuilder = mockUserRepository.createQueryBuilder();
      queryBuilder.getOne.mockResolvedValue(mockUser);
      mockExpertRepository.findOne.mockResolvedValue(null);
      mockJwtService.sign.mockReturnValue('token');

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result.user).not.toHaveProperty('password');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('role');
    });
  });
});
