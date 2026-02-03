import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PassportModule } from './modules/passport/passport.module';
import { LifecycleModule } from './modules/lifecycle/lifecycle.module';
import { ServiceOrderModule } from './modules/service-order/service-order.module';
import { ScanModule } from './modules/scan/scan.module';
import { ProductTypeModule } from './modules/product-type/product-type.module';
import { UploadModule } from './modules/upload/upload.module';
import { RegistrationModule } from './modules/registration/registration.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { MatchingModule } from './modules/matching/matching.module';
import { InquiryModule } from './modules/inquiry/inquiry.module';
import { SavedModule } from './modules/saved/saved.module';
import { ExpertModule } from './modules/expert/expert.module';
import { ServiceRequestModule } from './modules/service-request/service-request.module';
import { ExpertMatchingModule } from './modules/expert-matching/expert-matching.module';
import { ExpertRatingModule } from './modules/expert-rating/expert-rating.module';
import { PointModule } from './modules/point/point.module';
import { InvitationModule } from './modules/invitation/invitation.module';
import { DeviceTakeoverModule } from './modules/device-takeover/device-takeover.module';
import { LocationModule } from './modules/location/location.module';
import { WebSocketModule } from './modules/websocket/websocket.module';
import { ExportModule } from './modules/export/export.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PermissionModule } from './modules/permission/permission.module';
import { HealthModule } from './health/health.module';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate Limiting - disabled in development for testing, strict in production
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: process.env.NODE_ENV === 'production' ? 10 : 10000, // Very relaxed in dev
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minute
        limit: process.env.NODE_ENV === 'production' ? 100 : 100000, // Very relaxed in dev
      },
      {
        name: 'long',
        ttl: 900000, // 15 minutes
        limit: process.env.NODE_ENV === 'production' ? 1000 : 1000000, // Very relaxed in dev
      },
    ]),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
      }),
      inject: [ConfigService],
    }),

    // Static file serving for uploads
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Feature modules
    HealthModule,
    AuthModule,
    UserModule,
    PermissionModule,
    PassportModule,
    LifecycleModule,
    ServiceOrderModule,
    ScanModule,
    ProductTypeModule,
    UploadModule,
    RegistrationModule,
    MarketplaceModule,
    MatchingModule,
    InquiryModule,
    SavedModule,
    ExpertModule,
    ServiceRequestModule,
    ExpertMatchingModule,
    ExpertRatingModule,
    PointModule,
    InvitationModule,
    DeviceTakeoverModule,
    LocationModule,
    WebSocketModule,
    ExportModule,
    AnalyticsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
