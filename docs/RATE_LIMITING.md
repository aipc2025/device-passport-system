# Rate Limiting & Input Validation Guide

## Overview

This document describes the rate limiting and input validation mechanisms implemented to protect public endpoints from abuse, enumeration attacks, and brute force attempts.

## Global Rate Limiting Configuration

**Location:** `apps/api/src/app.module.ts`

### Throttle Tiers

```typescript
ThrottlerModule.forRoot([
  {
    name: 'short',
    ttl: 1000,      // 1 second
    limit: 10,      // 10 requests per second (default)
  },
  {
    name: 'medium',
    ttl: 60000,     // 1 minute
    limit: 100,     // 100 requests per minute (default)
  },
  {
    name: 'long',
    ttl: 900000,    // 15 minutes
    limit: 1000,    // 1000 requests per 15 minutes (default)
  },
])
```

### Global Guard

The `ThrottlerGuard` is applied globally to all endpoints via `APP_GUARD`. Individual endpoints can override these defaults using the `@Throttle()` decorator.

## Endpoint-Specific Rate Limits

### 1. Authentication Endpoints

**Location:** `apps/api/src/modules/auth/auth.controller.ts`

#### POST /auth/login
```typescript
@Throttle({ short: { limit: 3, ttl: 1000 } })      // 3/sec
@Throttle({ medium: { limit: 10, ttl: 60000 } })   // 10/min
@Throttle({ long: { limit: 30, ttl: 900000 } })    // 30/15min
```

**Purpose:** Prevent brute force password attacks

#### POST /auth/register
```typescript
@Throttle({ short: { limit: 2, ttl: 1000 } })      // 2/sec
@Throttle({ medium: { limit: 5, ttl: 60000 } })    // 5/min
@Throttle({ long: { limit: 20, ttl: 900000 } })    // 20/15min
```

**Purpose:** Prevent mass account creation and spam

#### POST /auth/refresh
```typescript
@Throttle({ short: { limit: 5, ttl: 1000 } })      // 5/sec
@Throttle({ medium: { limit: 20, ttl: 60000 } })   // 20/min
```

**Purpose:** Prevent token refresh abuse

### 2. Public Scan Endpoints

**Location:** `apps/api/src/modules/scan/scan.controller.ts`

#### GET /scan/device/:code & GET /scan/:code (legacy)
```typescript
@Throttle({ short: { limit: 5, ttl: 1000 } })      // 5/sec
@Throttle({ medium: { limit: 20, ttl: 60000 } })   // 20/min
```

**Purpose:** Prevent enumeration attacks to discover valid device codes

**Input Sanitization:**
```typescript
const sanitizedCode = code.trim().toUpperCase();
```

#### GET /scan/device/:code/validate & GET /scan/:code/validate (legacy)
```typescript
@Throttle({ short: { limit: 10, ttl: 1000 } })     // 10/sec (higher because it's lightweight)
@Throttle({ medium: { limit: 50, ttl: 60000 } })   // 50/min
```

**Purpose:** Allow validation checks but prevent mass scanning

#### GET /scan/expert/:code
```typescript
@Throttle({ short: { limit: 5, ttl: 1000 } })      // 5/sec
@Throttle({ medium: { limit: 20, ttl: 60000 } })   // 20/min
```

**Purpose:** Prevent expert profile enumeration

#### GET /scan/expert/:code/validate
```typescript
@Throttle({ short: { limit: 10, ttl: 1000 } })     // 10/sec
@Throttle({ medium: { limit: 50, ttl: 60000 } })   // 50/min
```

### 3. Registration Endpoints

**Location:** `apps/api/src/modules/registration/registration.controller.ts`

#### POST /registration/company
```typescript
@Throttle({ short: { limit: 2, ttl: 1000 } })      // 2/sec
@Throttle({ medium: { limit: 5, ttl: 60000 } })    // 5/min
@Throttle({ long: { limit: 20, ttl: 900000 } })    // 20/15min
```

**Purpose:** Prevent mass company registration spam

#### POST /registration/expert
```typescript
@Throttle({ short: { limit: 2, ttl: 1000 } })      // 2/sec
@Throttle({ medium: { limit: 5, ttl: 60000 } })    // 5/min
@Throttle({ long: { limit: 20, ttl: 900000 } })    // 20/15min
```

**Purpose:** Prevent mass expert registration spam

#### GET /registration/check-code/:code
```typescript
@Throttle({ short: { limit: 10, ttl: 1000 } })     // 10/sec
@Throttle({ medium: { limit: 50, ttl: 60000 } })   // 50/min
```

**Input Validation:**
```typescript
const sanitizedCode = code.trim().toUpperCase();
if (!/^[A-Z]{3}$/.test(sanitizedCode)) {
  return { available: false, message: 'Invalid code format. Must be exactly 3 uppercase letters.' };
}
```

**Purpose:** Allow legitimate code availability checks while preventing enumeration

## Input Validation

### Scan Code DTOs

**Location:** `apps/api/src/modules/scan/dto/scan-code.dto.ts`

#### Device Passport Code
```typescript
@IsString()
@MinLength(10)
@MaxLength(50)
@Matches(/^[A-Z0-9-]+$/, {
  message: 'Code must contain only uppercase letters, numbers, and hyphens',
})
```

**Valid Format:** `DP-XXX-YYYY-XXX-XX-NNNNNN-CC`
**Example:** `DP-MED-2025-PLC-DE-000001-A7`

#### Expert Passport Code
```typescript
@IsString()
@MinLength(10)
@MaxLength(50)
@Matches(/^[A-Z0-9-]+$/, {
  message: 'Code must contain only uppercase letters, numbers, and hyphens',
})
```

**Valid Format:** `EP-XXXX-YYMM-NNNNNN-CC`
**Example:** `EP-TECH-2501-000001-A7`

### Input Sanitization

All public endpoints that accept code parameters apply sanitization:

```typescript
const sanitizedCode = code.trim().toUpperCase();
```

This ensures:
- Leading/trailing whitespace is removed
- Codes are normalized to uppercase for consistent matching
- Case-insensitive lookups work correctly

## Response Codes

### Rate Limit Exceeded

**HTTP Status:** `429 Too Many Requests`

**Headers:**
```
X-RateLimit-Limit: <limit>
X-RateLimit-Remaining: <remaining>
X-RateLimit-Reset: <reset_timestamp>
```

**Response Body:**
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

### Validation Errors

**HTTP Status:** `400 Bad Request`

**Response Body:**
```json
{
  "statusCode": 400,
  "message": [
    "Code must be at least 10 characters long",
    "Code must contain only uppercase letters, numbers, and hyphens"
  ],
  "error": "Bad Request"
}
```

## Security Best Practices

### 1. Defense in Depth

Multiple layers of protection:
- Global rate limiting (all endpoints)
- Endpoint-specific limits (critical endpoints)
- Input validation (DTOs with class-validator)
- Input sanitization (trim, uppercase)
- Pattern matching (regex validation)

### 2. Enumeration Attack Prevention

**Problem:** Attackers could try sequential codes to discover valid passports

**Solutions:**
- Strict rate limits on scan endpoints (5 requests/sec, 20/min)
- No different response times for valid vs invalid codes
- Input validation prevents malformed requests
- Monitoring via rate limit headers

### 3. Brute Force Prevention

**Login Protection:**
- 3 attempts per second
- 10 attempts per minute
- 30 attempts per 15 minutes
- Account lockout should be implemented at application level (future enhancement)

**Registration Protection:**
- 2 registrations per second
- 5 registrations per minute
- 20 registrations per 15 minutes
- Prevents spam and abuse

### 4. Resource Protection

Validation endpoints have higher limits (10/sec, 50/min) because:
- They're computationally lightweight
- They don't access sensitive data
- Used for form validation in UIs
- Still protected against abuse

## Monitoring & Logging

### Rate Limit Headers

All responses include rate limit information:

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1704895234
```

### Recommended Monitoring

1. **Track 429 responses** - High rates indicate:
   - Potential attack
   - Client-side bugs (retry loops)
   - Need to adjust limits

2. **Monitor endpoint usage patterns** - Detect:
   - Unusual spikes in scan requests
   - Sequential code scanning attempts
   - Distributed attacks from multiple IPs

3. **Alert on anomalies:**
   - Sudden surge in validation requests
   - High 429 rates from single IP
   - Unusual geographic patterns

## Future Enhancements

### 1. IP-Based Rate Limiting

Current implementation uses global limits. Consider:
- Per-IP rate limiting
- Whitelist for known good IPs
- Blacklist for repeat offenders

### 2. Account Lockout

For authenticated endpoints:
- Lock account after N failed login attempts
- Require email verification to unlock
- Progressive delays after failed attempts

### 3. CAPTCHA Integration

For public endpoints:
- Require CAPTCHA after hitting rate limit
- Honeypot fields in registration forms
- Bot detection mechanisms

### 4. Distributed Rate Limiting

For production clusters:
- Redis-backed rate limiting
- Shared state across instances
- Consistent limits in load-balanced environments

### 5. Adaptive Rate Limiting

Dynamic limits based on:
- User reputation score
- Account age
- Successful request history
- Geographic location

## Testing Rate Limits

### Manual Testing

```bash
# Test login rate limit (should fail after 3 rapid requests)
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n"
  sleep 0.3
done

# Test scan rate limit
for i in {1..25}; do
  curl http://localhost:3000/api/v1/scan/device/DP-TEST-2025-PLC-CN-000001-XX \
    -w "\nStatus: %{http_code}\n"
  sleep 0.2
done
```

### Expected Behavior

1. **First N requests:** Return 200 or appropriate status
2. **After limit exceeded:** Return 429
3. **After TTL expires:** Limits reset, requests succeed again

## Configuration

### Environment Variables

No environment variables needed for current implementation. All limits are hardcoded in decorators.

For future Redis-based throttling:

```env
THROTTLE_STORAGE=redis
REDIS_HOST=localhost
REDIS_PORT=6379
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

## Troubleshooting

### Issue: Legitimate users hitting rate limits

**Solutions:**
- Increase endpoint-specific limits
- Implement authenticated vs anonymous limits
- Add IP whitelisting
- Optimize client-side code to reduce requests

### Issue: 429 errors in development

**Solutions:**
- Disable throttling in development:
  ```typescript
  @Throttle({ default: { limit: 0 } }) // Unlimited
  ```
- Use longer TTLs in dev environment
- Reset Redis cache between test runs

### Issue: Rate limits not working

**Checklist:**
1. Verify `ThrottlerModule` is imported
2. Check `ThrottlerGuard` is in `APP_GUARD`
3. Confirm `@nestjs/throttler` version compatibility
4. Check for `@SkipThrottle()` decorators
5. Verify no middleware bypassing guards

## Summary

This rate limiting implementation provides robust protection against:
- ✅ Brute force attacks on authentication
- ✅ Enumeration attacks on scan endpoints
- ✅ Mass registration spam
- ✅ Resource exhaustion
- ✅ API abuse

Combined with input validation, it creates a secure foundation for public-facing endpoints while maintaining good user experience for legitimate use cases.
