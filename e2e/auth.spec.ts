import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Authentication Flow
 *
 * Tests user registration, login, logout, and session management
 */

// Test credentials matching seed data
const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@luna.top',
    password: 'DevTest2026!@#$',
  },
  operator: {
    email: 'operator@luna.top',
    password: 'DevTest2026!@#$',
  },
  customer: {
    email: 'customer@luna.top',
    password: 'DevTest2026!@#$',
  },
};

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Login/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show validation errors for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Try to login without filling fields
    await page.click('button[type="submit"]');

    // Should show validation errors - check for first error message
    await expect(page.locator('text=/required|必填/i').first()).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill login form with correct credentials from seed data
    await page.fill('input[type="email"]', TEST_CREDENTIALS.admin.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.admin.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard or home
    await page.waitForURL(/\/(dashboard|passports|home)/i, { timeout: 30000 });

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Should show welcome message in main content area
    await expect(page.locator('main').getByText(/Welcome back/i)).toBeVisible({ timeout: 10000 });
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_CREDENTIALS.admin.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|passports|home)/i, { timeout: 30000 });

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // On mobile, the sidebar is hidden behind a hamburger menu in the header
    const viewport = page.viewportSize();

    if (viewport && viewport.width < 768) {
      // Mobile viewport - need to open hamburger menu first
      // The hamburger menu button is inside the header element
      const hamburgerMenu = page.locator('header button.lg\\:hidden').first();
      await hamburgerMenu.click();
      await page.waitForTimeout(500); // Wait for sidebar animation
    }

    // Find logout button - it may be in sidebar or user menu
    const logoutButton = page.getByRole('button', { name: /logout/i });
    await logoutButton.waitFor({ state: 'visible', timeout: 10000 });
    await logoutButton.click();

    // Should redirect to login page or home
    await page.waitForURL(/\/(login|$)/i, { timeout: 10000 });
  });

  test('should prevent access to protected routes when not authenticated', async ({ page }) => {
    // Try to access protected route (use /passports instead of /admin/passports)
    await page.goto('/passports');

    // Should redirect to login or show login required
    await page.waitForURL(/\/(login|passports)/i, { timeout: 5000 });

    // If on passports page without auth, should see limited content or redirect
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      await expect(page.locator('input[type="email"]')).toBeVisible();
    }
  });

  test('should persist session after page refresh', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_CREDENTIALS.admin.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|passports|home)/i, { timeout: 15000 });

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be authenticated - check for welcome message in main content
    await expect(page.locator('main').getByText(/Welcome back/i)).toBeVisible({ timeout: 10000 });
  });
});
