import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);

  // ==========================================
  // Security Middleware
  // ==========================================

  // Helmet - Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  // Compression
  app.use(compression());

  // ==========================================
  // CORS Configuration
  // ==========================================
  const corsOrigins = configService.get('CORS_ORIGINS')?.split(',') || [];
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: configService.get('CORS_CREDENTIALS') === 'true',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400, // 24 hours
  });

  // ==========================================
  // Global Prefix
  // ==========================================
  app.setGlobalPrefix('api/v1');

  // ==========================================
  // Validation Pipe
  // ==========================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: false, // Set to true for production if you don't want to expose validation errors
    })
  );

  // ==========================================
  // Swagger Documentation (Conditionally Enabled)
  // ==========================================
  if (configService.get('NODE_ENV') !== 'production' || configService.get('ENABLE_SWAGGER') === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Device Passport System API')
      .setDescription('B2B Device Passport Traceability System - API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('passports', 'Device passport management')
      .addTag('scan', 'Public scanning endpoints')
      .addTag('lifecycle', 'Lifecycle event tracking')
      .addTag('marketplace', 'B2B marketplace')
      .addTag('experts', 'Expert service system')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // ==========================================
  // Graceful Shutdown
  // ==========================================
  app.enableShutdownHooks();

  // ==========================================
  // Start Server
  // ==========================================
  const port = configService.get('PORT') || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║   Device Passport System - API Server                    ║
    ║   Environment: ${configService.get('NODE_ENV')?.padEnd(43) || 'production'.padEnd(43)}║
    ║   Port: ${port.toString().padEnd(50)}║
    ║   URL: http://0.0.0.0:${port}/api/v1${' '.repeat(28)}║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
  `);

  // Log important configuration
  console.log('Configuration:');
  console.log(`  - Database: ${configService.get('DATABASE_HOST')}:${configService.get('DATABASE_PORT')}`);
  console.log(`  - Redis: ${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`);
  console.log(`  - CORS Origins: ${corsOrigins.join(', ') || 'All'}`);
  console.log(`  - Rate Limiting: ${configService.get('RATE_LIMIT_ENABLED') === 'true' ? 'Enabled' : 'Disabled'}`);
  console.log(`  - JWT Expiry: ${configService.get('JWT_EXPIRES_IN')}`);
  console.log('');
  console.log('Ready to accept connections! 🚀');
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
