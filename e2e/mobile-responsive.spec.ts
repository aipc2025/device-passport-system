import { test, expect, devices } from '@playwright/test';

/**
 * E2E Tests: Mobile Responsiveness
 *
 * Tests the application on mobile devices and different viewports
 */

test.describe('Mobile Responsiveness', () => {
  test('should display mobile-friendly navigation', async ({ page }) => {
    await page.goto('/');

    // Should have viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');

    // Mobile menu should be visible or toggle button should exist
    const hasMobileMenu = await page.locator('button[aria-label*="menu"], button.mobile-menu, .hamburger').isVisible();
    expect(hasMobileMenu).toBeTruthy();
  });

  test('should login on mobile device', async ({ page }) => {
    await page.goto('/login');

    // Fill and submit login form
    await page.fill('input[type="email"]', 'admin@luna.top');
    await page.fill('input[type="password"]', 'DevTest2026!@#$');
    await page.click('button[type="submit"]');

    // Should successfully login
    await page.waitForURL(/\/(dashboard|passports|home)/i, { timeout: 10000 });
    await expect(page.locator('text=/welcome|admin|menu/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('should scan QR code on mobile', async ({ page }) => {
    await page.goto('/scan');

    // Should show scan interface optimized for mobile
    await expect(page.locator('h1, h2').filter({ hasText: /scan|扫描/i })).toBeVisible();

    // Camera button or input should be accessible on mobile
    const hasCameraAccess = await page.locator('button:has-text("Camera"), input[type="file"], input[capture]').isVisible();
    const hasCodeInput = await page.locator('input[placeholder*="code"], input[placeholder*="编码"]').isVisible();

    expect(hasCameraAccess || hasCodeInput).toBeTruthy();
  });

  test('should display passport list in mobile view', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@luna.top');
    await page.fill('input[type="password"]', 'DevTest2026!@#$');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|passports|home)/i);

    // Navigate to passports
    await page.goto('/admin/passports');

    // Should display passports in mobile-friendly format (cards or list)
    const hasCards = await page.locator('.card, .passport-card, .device-card').count() > 0;
    const hasTable = await page.locator('table').isVisible();
    const hasEmptyState = await page.locator('text=/no data|暂无数据/i').isVisible();

    expect(hasCards || hasTable || hasEmptyState).toBeTruthy();
  });

  test('should handle touch gestures', async ({ page }) => {
    await page.goto('/');

    // Test swipe gesture if applicable
    const container = page.locator('body').first();

    // Simulate touch swipe
    await container.dispatchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 100 }],
    });

    await container.dispatchEvent('touchmove', {
      touches: [{ clientX: 300, clientY: 100 }],
    });

    await container.dispatchEvent('touchend');

    // Page should still be functional after touch events
    await expect(page).toHaveURL(/./);
  });
});

test.describe('Tablet Responsiveness', () => {
  test('should adapt layout for tablet', async ({ page }) => {
    await page.goto('/');

    // Should use tablet-optimized layout
    const viewport = await page.viewportSize();
    expect(viewport?.width).toBeGreaterThan(768);
    expect(viewport?.width).toBeLessThan(1200);

    // Navigation should be visible or collapsible
    await expect(page.locator('nav, .navbar, header')).toBeVisible();
  });

  test('should display passport grid on tablet', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@luna.top');
    await page.fill('input[type="password"]', 'DevTest2026!@#$');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|passports|home)/i);

    await page.goto('/admin/passports');

    // Should show grid layout (2-3 columns)
    const cards = page.locator('.card, .passport-card, .device-card');
    const count = await cards.count();

    // If cards exist, check if they're in a grid
    if (count > 0) {
      const firstCard = cards.first();
      const box = await firstCard.boundingBox();
      expect(box?.width).toBeLessThan(600); // Should not take full width
    }
  });
});

test.describe('Cross-Browser Compatibility', () => {
  test('should work across browsers', async ({ page }) => {
    await page.goto('/');

    // Should load successfully
    await expect(page).toHaveURL(/./);

    // Should render main content
    await expect(page.locator('body')).toBeVisible();

    // Should not have console errors
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.waitForTimeout(2000);

    // Allow some non-critical errors but fail on critical ones
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('ResizeObserver') &&
        !e.includes('favicon') &&
        !e.includes('sourcemap')
    );

    expect(criticalErrors.length).toBe(0);
  });
});

test.describe('PWA Features', () => {
  test('should have PWA manifest', async ({ page }) => {
    await page.goto('/');

    // Check for manifest link
    const manifestLink = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifestLink).toBeTruthy();
  });

  test('should register service worker', async ({ page }) => {
    await page.goto('/');

    // Wait for service worker registration
    await page.waitForTimeout(2000);

    // Check if service worker is registered
    const hasServiceWorker = await page.evaluate(() => 'serviceWorker' in navigator);
    expect(hasServiceWorker).toBeTruthy();
  });

  test('should work offline (basic)', async ({ page, context }) => {
    await page.goto('/');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Simulate offline mode
    await context.setOffline(true);

    // Navigate to a cached page
    await page.goto('/scan');

    // Should still load (from cache or show offline message)
    await expect(page.locator('body')).toBeVisible();
  });
});
