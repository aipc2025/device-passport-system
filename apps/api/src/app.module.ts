import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
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
    AuthModule,
    UserModule,
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
  ],
})
export class AppModule {}
