import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, IndividualExpert } from '../../database/entities';
import { LoginDto, RegisterDto } from './dto';
import { TokenPayload, AuthResponse, UserRole } from '@device-passport/shared';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(IndividualExpert)
    private expertRepository: Repository<IndividualExpert>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: email.toLowerCase() })
      .getOne();

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is an individual expert
    const expert = await this.expertRepository.findOne({
      where: { userId: user.id },
    });

    // Update last login
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    return this.generateTokens(user, expert);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, name, organizationId } = registerDto;

    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: UserRole.CUSTOMER,
      organizationId,
    });

    await this.userRepository.save(user);

    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify<TokenPayload>(refreshToken);
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid token');
      }

      // Check if user is an individual expert
      const expert = await this.expertRepository.findOne({
        where: { userId: user.id },
      });

      return this.generateTokens(user, expert);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });
  }

  private generateTokens(user: User, expert?: IndividualExpert | null): AuthResponse {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    // Add expert info if available
    const userResponse = {
      ...userWithoutPassword,
      isExpert: !!expert,
      expertId: expert?.id,
    };

    return {
      user: userResponse as Omit<User, 'password'>,
      accessToken,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    };
  }
}
