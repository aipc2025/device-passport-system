import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Auth', () => {
    it('/api/v1/auth/login (POST) - should fail with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'invalid@test.com', password: 'wrongpassword' })
        .expect(401);
    });
  });

  describe('Scan', () => {
    it('/api/v1/scan/:code/validate (GET) - should validate passport code format', () => {
      return request(app.getHttpServer())
        .get('/api/v1/scan/DP-MED-2025-PLC-DE-000001-A7/validate')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('valid');
        });
    });

    it('/api/v1/scan/:code/validate (GET) - should reject invalid code', () => {
      return request(app.getHttpServer())
        .get('/api/v1/scan/INVALID-CODE/validate')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.valid).toBe(false);
        });
    });
  });
});
