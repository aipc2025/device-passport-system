# Production Deployment Checklist
## Device Passport System

**Last Updated**: 2026-02-03
**Version**: 1.1.0
**Environment**: Production

---

## Pre-Deployment Checklist

### 1. Code Quality ✅

- [ ] All TypeScript compilation errors resolved
  ```bash
  pnpm typecheck
  # Should show: Tasks: 4 successful, 4 total
  ```

- [ ] All tests passing
  ```bash
  pnpm test
  # Backend coverage: >80%
  # Frontend coverage: >70%
  ```

- [ ] E2E tests passing
  ```bash
  pnpm test:e2e
  # All critical flows verified
  ```

- [ ] No linting errors
  ```bash
  pnpm lint
  # All files pass
  ```

- [ ] Code formatted
  ```bash
  pnpm format
  # All files formatted
  ```

- [ ] Build successful
  ```bash
  pnpm build
  # Both API and Web build successfully
  ```

---

### 2. Environment Configuration 🔧

#### Backend Environment Variables

Create `.env.production` in `apps/api/`:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database
DATABASE_SSL=true

# Redis
REDIS_URL=redis://host:6379
REDIS_PASSWORD=your-redis-password
REDIS_TLS=true

# JWT
JWT_SECRET=your-super-secret-key-minimum-32-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-minimum-32-characters
JWT_REFRESH_EXPIRES_IN=7d

# Application
NODE_ENV=production
PORT=3000
API_PREFIX=/api/v1

# CORS
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_DEST=./uploads

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# WebSocket
WS_PORT=3001

# Email (if configured)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Monitoring (optional)
SENTRY_DSN=https://your-sentry-dsn
```

#### Frontend Environment Variables

Create `.env.production` in `apps/web/`:

```bash
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_WS_URL=wss://api.yourdomain.com
VITE_APP_NAME=Device Passport System
VITE_APP_VERSION=1.1.0
```

**Security Checklist:**
- [ ] All secrets are unique and secure (min 32 characters)
- [ ] JWT secrets are different from database passwords
- [ ] No default or test credentials
- [ ] `.env.production` added to `.gitignore`
- [ ] Secrets stored in secure vault (AWS Secrets Manager, Azure Key Vault, etc.)

---

### 3. Database Preparation 💾

- [ ] **Production database created**
  ```sql
  CREATE DATABASE device_passport;
  CREATE USER app_user WITH ENCRYPTED PASSWORD 'secure-password';
  GRANT ALL PRIVILEGES ON DATABASE device_passport TO app_user;
  ```

- [ ] **Database connection verified**
  ```bash
  psql -h your-db-host -U app_user -d device_passport
  ```

- [ ] **Run migrations**
  ```bash
  pnpm db:migrate
  # Verify all migrations applied
  ```

- [ ] **Do NOT run seed in production**
  - ⚠️ `pnpm db:seed` is for development only
  - Create production admin account manually

- [ ] **Database backup configured**
  - Daily automatic backups
  - Retention period: 30 days minimum
  - Test backup restoration

- [ ] **Database indexes verified**
  ```sql
  SELECT tablename, indexname FROM pg_indexes
  WHERE schemaname = 'public';
  ```

- [ ] **Database performance tuning**
  - `shared_buffers` configured
  - `max_connections` set appropriately
  - `work_mem` optimized

---

### 4. Redis Configuration ⚡

- [ ] **Redis instance created**
  - Version: 7.x
  - TLS enabled
  - Password protected

- [ ] **Redis connection verified**
  ```bash
  redis-cli -h your-redis-host -a your-password ping
  # Should return: PONG
  ```

- [ ] **Redis persistence configured**
  - RDB snapshots enabled
  - AOF enabled (if needed)

- [ ] **Memory limits set**
  ```
  maxmemory 256mb
  maxmemory-policy allkeys-lru
  ```

---

### 5. Security Hardening 🔒

#### Application Security

- [ ] **Helmet middleware enabled** (already configured)
- [ ] **CORS properly configured**
  - Only allow trusted origins
  - No wildcard (*) in production

- [ ] **Rate limiting configured**
  - Login: 5 attempts per minute
  - API: 100 requests per minute
  - Public endpoints: 20 requests per minute

- [ ] **Input validation**
  - All DTOs have validation decorators
  - File upload restrictions enforced

- [ ] **HTTPS enforced**
  - SSL certificate installed
  - HTTP redirects to HTTPS
  - HSTS headers enabled

#### Authentication Security

- [ ] **Password requirements**
  - Minimum 8 characters
  - bcrypt rounds: 10

- [ ] **JWT configuration**
  - Access token: 15 minutes
  - Refresh token: 7 days
  - Token rotation enabled

- [ ] **Session management**
  - Redis-backed sessions
  - Auto logout on inactivity

#### Infrastructure Security

- [ ] **Firewall rules**
  - Only ports 80, 443 open to public
  - Database port restricted to app servers only
  - Redis port restricted to app servers only

- [ ] **SSH access**
  - Key-based authentication only
  - Root login disabled
  - Fail2ban configured

- [ ] **Security updates**
  - OS packages up-to-date
  - Docker images updated
  - Dependencies scanned for vulnerabilities

---

### 6. Performance Optimization ⚡

#### Backend

- [ ] **Database connection pooling**
  ```typescript
  // TypeORM config
  poolSize: 10
  ```

- [ ] **Redis caching**
  - Static data: 1 hour TTL
  - User data: 15 min TTL
  - Session data: 7 days TTL

- [ ] **Response compression**
  - Gzip enabled
  - Compression level: 6

- [ ] **Query optimization**
  - Indexes on foreign keys
  - Avoid N+1 queries
  - Pagination for large datasets

#### Frontend

- [ ] **Build optimization**
  ```bash
  pnpm build:web
  # Check bundle size
  ```

- [ ] **Code splitting verified**
  - Main bundle < 800 KB
  - Vendor chunks separated
  - Route-based lazy loading

- [ ] **Image optimization**
  - Images compressed
  - WebP format where supported
  - Lazy loading enabled

- [ ] **CDN configuration**
  - Static assets served from CDN
  - Cache headers configured
  - Gzip/Brotli compression

---

### 7. Monitoring & Logging 📊

#### Application Monitoring

- [ ] **Health check endpoint**
  ```bash
  GET /api/health
  # Returns: { status: "ok", database: "connected", redis: "connected" }
  ```

- [ ] **Uptime monitoring**
  - Pingdom / UptimeRobot configured
  - Alert on 5xx errors
  - Alert on 99% uptime threshold

- [ ] **Performance monitoring**
  - Response time < 200ms (p95)
  - Error rate < 1%
  - Server metrics (CPU, Memory, Disk)

#### Error Tracking

- [ ] **Sentry configured** (recommended)
  ```typescript
  // apps/api/src/main.ts
  import * as Sentry from '@sentry/node';

  Sentry.init({ dsn: process.env.SENTRY_DSN });
  ```

- [ ] **Error notifications**
  - Email alerts for critical errors
  - Slack integration
  - PagerDuty for on-call

#### Logging

- [ ] **Structured logging**
  - JSON format
  - Log levels configured
  - Sensitive data redacted

- [ ] **Log aggregation**
  - ELK Stack / Loki configured
  - Retention: 30 days
  - Log rotation enabled

- [ ] **Audit logging**
  - User login/logout
  - Data modifications
  - Admin actions

---

### 8. Backup & Disaster Recovery 💾

- [ ] **Database backups**
  - Daily full backup
  - Hourly incremental backup
  - 30-day retention
  - Backup restoration tested

- [ ] **File storage backups**
  - User uploads backed up
  - S3 versioning enabled
  - Cross-region replication

- [ ] **Disaster recovery plan**
  - RTO (Recovery Time Objective): 4 hours
  - RPO (Recovery Point Objective): 1 hour
  - DR runbook documented
  - Annual DR drill

---

### 9. Deployment Process 🚀

#### Option A: Docker Compose (Single Server)

```bash
# 1. Pull latest code
git pull origin master

# 2. Build images
docker-compose -f docker/docker-compose.prod.yml build

# 3. Stop old containers
docker-compose -f docker/docker-compose.prod.yml down

# 4. Start new containers
docker-compose -f docker/docker-compose.prod.yml up -d

# 5. Verify health
curl http://localhost:3000/api/health
```

#### Option B: Kubernetes (Scalable)

```bash
# 1. Build and push images
docker build -t your-registry/device-passport-api:v1.1.0 -f docker/Dockerfile.api .
docker build -t your-registry/device-passport-web:v1.1.0 -f docker/Dockerfile.web .
docker push your-registry/device-passport-api:v1.1.0
docker push your-registry/device-passport-web:v1.1.0

# 2. Update Kubernetes manifests
kubectl set image deployment/api api=your-registry/device-passport-api:v1.1.0
kubectl set image deployment/web web=your-registry/device-passport-web:v1.1.0

# 3. Monitor rollout
kubectl rollout status deployment/api
kubectl rollout status deployment/web

# 4. Verify pods
kubectl get pods
```

#### Post-Deployment Verification

- [ ] **Smoke tests**
  - Homepage loads: https://yourdomain.com
  - API responds: https://api.yourdomain.com/api/health
  - Login works
  - QR scan works

- [ ] **Database connectivity**
  ```bash
  # Check from app container
  psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
  ```

- [ ] **Redis connectivity**
  ```bash
  redis-cli -u $REDIS_URL ping
  ```

- [ ] **SSL certificate**
  ```bash
  # Check expiry
  echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | \
    openssl x509 -noout -dates
  ```

---

### 10. Documentation 📚

- [ ] **API documentation accessible**
  - https://api.yourdomain.com/api/docs

- [ ] **User documentation published**
  - Operation manual available
  - Training materials prepared
  - Video tutorials (if applicable)

- [ ] **Admin runbook**
  - Common tasks documented
  - Troubleshooting guide
  - Emergency contacts

---

### 11. User Communication 📢

- [ ] **Maintenance window scheduled**
  - Users notified 48 hours in advance
  - Low-traffic time selected

- [ ] **Release notes prepared**
  - New features listed
  - Bug fixes documented
  - Breaking changes highlighted

- [ ] **Support team briefed**
  - Known issues documented
  - Escalation procedure defined

---

### 12. Rollback Plan 🔄

- [ ] **Previous version tagged**
  ```bash
  git tag v1.0.0
  git push origin v1.0.0
  ```

- [ ] **Database migration rollback tested**
  ```bash
  pnpm --filter @device-passport/api run migration:revert
  ```

- [ ] **Container rollback ready**
  ```bash
  # Docker Compose
  docker-compose -f docker/docker-compose.prod.yml down
  docker-compose -f docker/docker-compose.prod.yml up -d --force-recreate

  # Kubernetes
  kubectl rollout undo deployment/api
  kubectl rollout undo deployment/web
  ```

---

## Post-Deployment Monitoring (First 24 Hours)

### Hour 1-4: Critical Monitoring

- [ ] Monitor error rates (should be < 1%)
- [ ] Monitor response times (p95 < 200ms)
- [ ] Check database connection pool
- [ ] Verify WebSocket connections
- [ ] Review error logs

### Hour 4-12: Performance Validation

- [ ] Monitor CPU usage (should be < 70%)
- [ ] Monitor memory usage (should be < 80%)
- [ ] Check disk space
- [ ] Verify cache hit rates
- [ ] Review slow query log

### Hour 12-24: User Feedback

- [ ] Monitor user reports
- [ ] Check support tickets
- [ ] Review application metrics
- [ ] Analyze user behavior patterns

---

## Production Checklist Sign-Off

### Technical Team

- [ ] **Developer**: _________________ Date: _______
- [ ] **DevOps Engineer**: _________________ Date: _______
- [ ] **QA Lead**: _________________ Date: _______
- [ ] **Security Officer**: _________________ Date: _______

### Management

- [ ] **Tech Lead**: _________________ Date: _______
- [ ] **Product Manager**: _________________ Date: _______
- [ ] **CTO**: _________________ Date: _______

---

## Emergency Contacts

**On-Call Engineer**:
- Name: _________________
- Phone: _________________
- Email: _________________

**Database Administrator**:
- Name: _________________
- Phone: _________________

**DevOps Lead**:
- Name: _________________
- Phone: _________________

**Escalation**:
- CTO Phone: _________________

---

**Deployment Status**: ⏳ Pending
**Target Go-Live**: _________________
**Actual Go-Live**: _________________

**End of Deployment Checklist**
