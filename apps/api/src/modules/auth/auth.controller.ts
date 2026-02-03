import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto';
import { Public, CurrentUser } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards';
import { TokenPayload } from '@device-passport/shared';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  // Relaxed limits for development/testing - production should use stricter limits
  @Throttle({ short: { limit: 100, ttl: 1000 } }) // 100 login attempts per second in dev
  @Throttle({ medium: { limit: 1000, ttl: 60000 } }) // 1000 login attempts per minute in dev
  @Throttle({ long: { limit: 10000, ttl: 900000 } }) // 10000 login attempts per 15 minutes in dev
  @ApiOperation({ summary: 'User login' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @Public()
  @Throttle({ short: { limit: 2, ttl: 1000 } }) // Max 2 registrations per second
  @Throttle({ medium: { limit: 5, ttl: 60000 } }) // Max 5 registrations per minute
  @Throttle({ long: { limit: 20, ttl: 900000 } }) // Max 20 registrations per 15 minutes
  @ApiOperation({ summary: 'User registration' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @Public()
  @Throttle({ short: { limit: 5, ttl: 1000 } }) // Max 5 refresh requests per second
  @Throttle({ medium: { limit: 20, ttl: 60000 } }) // Max 20 refresh requests per minute
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() refreshDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshDto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async me(@CurrentUser() user: TokenPayload) {
    return this.authService.validateUser(user.sub);
  }
}
