# E2E Testing Guide

## 📋 Overview

This project uses [Playwright](https://playwright.dev/) for end-to-end (E2E) testing. Playwright tests simulate real user interactions across multiple browsers and devices.

## 🚀 Quick Start

### Prerequisites

1. Install dependencies:
```bash
pnpm install
```

2. Install Playwright browsers:
```bash
pnpm exec playwright install
```

### Running Tests

```bash
# Run all E2E tests (headless mode)
pnpm test:e2e

# Run tests with UI (interactive mode)
pnpm test:e2e:ui

# Run tests in headed mode (see browser)
pnpm test:e2e:headed

# Debug tests
pnpm test:e2e:debug

# Run mobile-only tests
pnpm test:e2e:mobile

# View test report
pnpm test:e2e:report

# Run all tests (unit + E2E)
pnpm test:all
```

## 📂 Test Structure

```
e2e/
├── auth.spec.ts                 # Authentication flow tests
├── device-passport.spec.ts      # Device passport management tests
└── mobile-responsive.spec.ts    # Mobile & responsive tests
```

## 🧪 Test Scenarios

### Authentication Tests (`auth.spec.ts`)
- ✅ Display login page
- ✅ Validate credentials
- ✅ Successful login/logout
- ✅ Protected route access
- ✅ Session persistence

### Device Passport Tests (`device-passport.spec.ts`)
- ✅ Display passport list
- ✅ Search passports
- ✅ View passport details
- ✅ Scan passport (public endpoint)
- ✅ Filter by status
- ✅ Export data

### Mobile Responsiveness Tests (`mobile-responsive.spec.ts`)
- ✅ Mobile-friendly navigation
- ✅ Login on mobile
- ✅ QR scanning on mobile
- ✅ Touch gestures
- ✅ Tablet layout
- ✅ Cross-browser compatibility
- ✅ PWA features

## 🎯 Test Coverage

### Browsers Tested
- ✅ Chromium (Chrome, Edge)
- ✅ Firefox
- ✅ WebKit (Safari)

### Devices Tested
- ✅ Desktop (1920x1080)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)
- ✅ Tablet (iPad Pro)

## 📝 Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.goto('/some-page');

    // Act
    await page.click('button');

    // Assert
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

### Authentication Helper

```typescript
async function login(page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@luna.medical');
  await page.fill('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(home|dashboard)/);
}
```

### Best Practices

#### 1. Use Meaningful Selectors

```typescript
// ❌ Bad - fragile
await page.click('.btn-123');

// ✅ Good - semantic
await page.click('button[type="submit"]');
await page.click('button:has-text("Submit")');
```

#### 2. Wait for Elements

```typescript
// ❌ Bad - race condition
await page.click('button');
expect(page.locator('.result')).toBeVisible();

// ✅ Good - wait for element
await page.click('button');
await expect(page.locator('.result')).toBeVisible();
```

#### 3. Handle Multiple Locales

```typescript
// ✅ Support both English and Chinese
await expect(
  page.locator('text=/welcome|欢迎/i')
).toBeVisible();
```

#### 4. Use Test Hooks

```typescript
test.beforeEach(async ({ page }) => {
  // Run before each test
  await login(page);
});

test.afterEach(async ({ page }) => {
  // Cleanup after each test
  await page.context().clearCookies();
});
```

## 🐛 Debugging Tests

### Using Playwright Inspector

```bash
pnpm test:e2e:debug
```

This opens Playwright Inspector where you can:
- Step through tests
- Inspect elements
- View console logs
- Take screenshots

### Visual Debugging

```bash
# Run with headed mode to see the browser
pnpm test:e2e:headed

# Run with UI mode for interactive debugging
pnpm test:e2e:ui
```

### Screenshots and Videos

Playwright automatically captures:
- 📸 Screenshots on failure
- 🎥 Videos on test failure
- 📊 Trace files for debugging

Artifacts are saved to `test-results/` directory.

### Console Logs

```typescript
// Capture console logs
page.on('console', msg => console.log(msg.text()));

// Capture errors
page.on('pageerror', error => console.error(error));
```

## 🔧 Configuration

### playwright.config.ts

Key configuration options:

```typescript
export default defineConfig({
  testDir: './e2e',              // Test directory
  fullyParallel: true,           // Run tests in parallel
  retries: process.env.CI ? 2 : 0, // Retry on CI
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',     // Trace on retry
    screenshot: 'only-on-failure', // Screenshot on fail
    video: 'retain-on-failure',  // Video on fail
  },
  webServer: [
    {
      command: 'pnpm dev:api',   // Start API server
      url: 'http://localhost:3000',
    },
    {
      command: 'pnpm dev:web',   // Start web server
      url: 'http://localhost:5173',
    },
  ],
});
```

### Environment Variables

```bash
# Set custom base URL
APP_URL=http://localhost:3000 pnpm test:e2e

# Run in CI mode
CI=true pnpm test:e2e
```

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm exec playwright install --with-deps
      - run: pnpm test:e2e

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 📊 Test Reports

### HTML Report

After running tests, view the HTML report:

```bash
pnpm test:e2e:report
```

The report includes:
- ✅ Test pass/fail status
- ⏱️ Execution time
- 📸 Screenshots
- 🎥 Videos
- 📊 Trace viewer

### JSON Report

For CI/CD integration:

```typescript
// playwright.config.ts
reporter: [
  ['html'],
  ['json', { outputFile: 'test-results.json' }],
  ['junit', { outputFile: 'test-results.xml' }]
]
```

## 🎯 Test Data Management

### Test Users

```typescript
// e2e/fixtures/users.ts
export const TEST_USERS = {
  admin: {
    email: 'admin@luna.medical',
    password: 'Password123!',
  },
  qc: {
    email: 'qc.wang@siemens.com.cn',
    password: 'Password123!',
  },
  customer: {
    email: 'admin@sinopec.com',
    password: 'Password123!',
  },
};
```

### Test Data Cleanup

```typescript
test.afterAll(async () => {
  // Clean up test data after all tests
  await cleanupTestData();
});
```

## 🔒 Security Testing

### Authentication Tests

- ✅ Test invalid credentials
- ✅ Test session expiration
- ✅ Test unauthorized access
- ✅ Test CSRF protection

### Input Validation

```typescript
test('should prevent XSS attacks', async ({ page }) => {
  await page.fill('input', '<script>alert("XSS")</script>');
  await page.click('button[type="submit"]');

  // Should escape HTML
  await expect(page.locator('text=<script>')).toBeVisible();
});
```

## 📈 Performance Testing

### Lighthouse Integration

```typescript
import { playAudit } from 'playwright-lighthouse';

test('should meet performance standards', async ({ page }) => {
  await page.goto('/');

  await playAudit({
    page,
    thresholds: {
      performance: 80,
      accessibility: 90,
      'best-practices': 80,
      seo: 80,
    },
  });
});
```

## 🌐 Internationalization Testing

```typescript
test.describe('Internationalization', () => {
  test('should support English', async ({ page }) => {
    await page.goto('/?lang=en');
    await expect(page.locator('text=Device Passport')).toBeVisible();
  });

  test('should support Chinese', async ({ page }) => {
    await page.goto('/?lang=zh');
    await expect(page.locator('text=设备护照')).toBeVisible();
  });
});
```

## 📱 Mobile Testing Tips

### Simulating Touch Events

```typescript
// Swipe gesture
await page.touchscreen.tap(100, 100);
await page.touchscreen.tap(300, 100);

// Pinch zoom
await page.evaluate(() => {
  window.visualViewport.scale = 2;
});
```

### Testing Camera Access

```typescript
// Mock camera permission
await page.context().grantPermissions(['camera']);

// Test QR code scanning
await page.click('button:has-text("Scan QR")');
```

## 🎭 Mocking and Stubbing

### Mock API Responses

```typescript
await page.route('**/api/v1/passports', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ data: mockPassports }),
  });
});
```

### Mock Geolocation

```typescript
await page.context().setGeolocation({
  latitude: 31.2304,
  longitude: 121.4737,
});
```

## 🆘 Troubleshooting

### Common Issues

#### Tests Timeout

```typescript
// Increase timeout for slow operations
test.setTimeout(60000); // 60 seconds

await page.waitForLoadState('networkidle', { timeout: 30000 });
```

#### Flaky Tests

```typescript
// Use retry logic
test.describe.configure({ retries: 2 });

// Wait for stable state
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1000); // Last resort
```

#### Element Not Found

```typescript
// Wait for element before interaction
await page.waitForSelector('button[type="submit"]');
await page.click('button[type="submit"]');

// Or use built-in waiting
await expect(page.locator('button')).toBeVisible();
await page.locator('button').click();
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

## 🎯 Test Coverage Goals

| Category | Current | Target |
|----------|---------|--------|
| Authentication | ✅ 100% | 100% |
| Device Passport | ✅ 80% | 90% |
| Mobile Responsive | ✅ 70% | 85% |
| Admin Features | ⏳ 60% | 80% |
| Expert Matching | ⏳ 50% | 75% |

## 🤝 Contributing

When adding new features:

1. ✅ Write E2E tests for user-facing features
2. ✅ Test on multiple browsers
3. ✅ Test on mobile devices
4. ✅ Update this documentation
5. ✅ Ensure tests pass in CI

---

**Last Updated:** 2026-02-02
**Maintainer:** Device Passport Team
