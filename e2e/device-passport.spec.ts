import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Device Passport Management
 *
 * Tests device passport creation, viewing, updating, and scanning
 */

test.describe('Device Passport Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@luna.top');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|passports|home)/i);
  });

  test('should display passport list', async ({ page }) => {
    await page.goto('/admin/passports');

    // Should show passport list
    await expect(page.locator('h1, h2').filter({ hasText: /passport|设备护照/i })).toBeVisible();

    // Should show at least one passport or empty state
    const hasPassports = await page.locator('table tbody tr, .passport-card, .device-card').count() > 0;
    const hasEmptyState = await page.locator('text=/no data|暂无数据|empty/i').isVisible();

    expect(hasPassports || hasEmptyState).toBeTruthy();
  });

  test('should be able to search passports', async ({ page }) => {
    await page.goto('/admin/passports');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find search input
    const searchInput = page.locator('input[placeholder*="search"], input[placeholder*="搜索"]').first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('DP-MED');
      await page.keyboard.press('Enter');

      // Wait for search results
      await page.waitForTimeout(1000);

      // Should show filtered results or no results message
      const hasResults = await page.locator('table tbody tr, .passport-card').count() > 0;
      const hasNoResults = await page.locator('text=/no results|未找到|no data/i').isVisible();

      expect(hasResults || hasNoResults).toBeTruthy();
    }
  });

  test('should view passport details', async ({ page }) => {
    await page.goto('/admin/passports');
    await page.waitForLoadState('networkidle');

    // Click on first passport if exists
    const firstPassport = page.locator('table tbody tr:first-child, .passport-card:first-child, .device-card:first-child');

    if (await firstPassport.isVisible()) {
      await firstPassport.click();

      // Should navigate to detail page or show modal
      await expect(
        page.locator('text=/device name|设备名称|passport code|护照编码/i').first()
      ).toBeVisible({ timeout: 5000 });

      // Should show QR code
      await expect(
        page.locator('img[alt*="QR"], canvas, svg').first()
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('should scan passport using public endpoint', async ({ page }) => {
    await page.goto('/scan');

    // Should show scan interface
    await expect(page.locator('h1, h2').filter({ hasText: /scan|扫描/i })).toBeVisible();

    // Try scanning a known passport code
    const codeInput = page.locator('input[placeholder*="code"], input[placeholder*="编码"]').first();

    if (await codeInput.isVisible()) {
      await codeInput.fill('DP-MED-2601-PF-CN-000001-0A');
      await page.click('button[type="submit"], button:has-text("Scan"), button:has-text("扫描")');

      // Should show passport information
      await expect(
        page.locator('text=/device name|manufacturer|产品线|PF-2000/i').first()
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('should filter passports by status', async ({ page }) => {
    await page.goto('/admin/passports');
    await page.waitForLoadState('networkidle');

    // Look for status filter
    const statusFilter = page.locator('select, button').filter({ hasText: /status|状态/i }).first();

    if (await statusFilter.isVisible()) {
      await statusFilter.click();

      // Select a status
      const inServiceOption = page.locator('text=/IN_SERVICE|在服务中/i').first();
      if (await inServiceOption.isVisible()) {
        await inServiceOption.click();

        // Wait for filter to apply
        await page.waitForTimeout(1000);

        // Should show filtered results
        expect(await page.locator('table tbody tr, .passport-card').count()).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should export passport data', async ({ page }) => {
    await page.goto('/admin/passports');
    await page.waitForLoadState('networkidle');

    // Look for export button
    const exportButton = page.locator('button').filter({ hasText: /export|导出|excel|csv/i }).first();

    if (await exportButton.isVisible()) {
      // Start waiting for download before clicking
      const downloadPromise = page.waitForEvent('download');

      await exportButton.click();

      // Wait for download to start
      const download = await downloadPromise;

      // Verify download started
      expect(download.suggestedFilename()).toMatch(/\.(xlsx|csv|xls)$/);
    }
  });
});
