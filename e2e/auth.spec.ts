import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Authentication Flow
 *
 * Tests user registration, login, logout, and session management
 */

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

    // Should show validation errors
    await expect(page.locator('text=/required|必填/i')).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill login form with correct credentials
    await page.fill('input[type="email"]', 'admin@luna.medical');
    await page.fill('input[type="password"]', 'Password123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for localStorage to be updated (persist middleware)
    await page.waitForFunction(
      () => window.localStorage.getItem('auth-storage') !== null,
      { timeout: 5000 }
    );

    // Should redirect to dashboard or home
    await page.waitForURL(/\/(dashboard|passports|home)/i, { timeout: 10000 });

    // Should show user menu or profile
    await expect(
      page.locator('text=/welcome|admin|profile|dashboard|账户/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@luna.medical');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|passports|home)/i);

    // Find and click logout button
    await page.click('button:has-text("Logout"), button:has-text("退出"), a:has-text("Logout")');

    // Should redirect to login page
    await page.waitForURL(/\/login/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should prevent access to protected routes when not authenticated', async ({ page }) => {
    // Try to access protected route
    await page.goto('/admin/passports');

    // Should redirect to login
    await page.waitForURL(/\/login/i, { timeout: 5000 });
  });

  test('should persist session after page refresh', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@luna.medical');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|passports|home)/i);

    // Refresh page
    await page.reload();

    // Should still be authenticated
    await expect(
      page.locator('text=/welcome|admin|profile|dashboard|账户/i').first()
    ).toBeVisible({ timeout: 10000 });
  });
});
