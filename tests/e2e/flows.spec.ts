import { test, expect, Page } from '@playwright/test';

/**
 * ScopeGuard E2E Test Flows
 *
 * These tests cover the critical user flows documented in .claude/features.md
 *
 * Prerequisites:
 * - Test account must exist (see .claude/test-accounts.md)
 * - Production environment must be accessible
 *
 * Run with: npx playwright test tests/e2e/flows.spec.ts
 */

const BASE_URL = process.env.SCOPEGUARD_URL || 'https://scopeguard.fly.dev';
const TEST_EMAIL = process.env.SCOPEGUARD_TEST_EMAIL || 'qa@scopeguard.test';
const TEST_PASSWORD = process.env.SCOPEGUARD_TEST_PASSWORD || 'QATest123!';

// Helper to login
async function login(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

test.describe('Public Pages', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/ScopeGuard/i);
    // Check for main CTA
    await expect(page.locator('text=Get Started').first()).toBeVisible();
  });

  test('login page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('register page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('forgot password page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/forgot-password`);
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

test.describe('Authentication Flow', () => {
  test('login with valid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/error|invalid|incorrect/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('protected routes redirect to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('dashboard loads with summary', async ({ page }) => {
    await expect(page.locator('text=/dashboard|overview|summary/i').first()).toBeVisible();
  });

  test('can navigate to projects', async ({ page }) => {
    await page.click('text=Projects');
    await expect(page).toHaveURL(/.*projects/);
  });

  test('can navigate to clients', async ({ page }) => {
    await page.click('text=Clients');
    await expect(page).toHaveURL(/.*clients/);
  });
});

test.describe('Projects Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('projects list loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/projects`);
    await expect(page).toHaveURL(/.*projects/);
    // Should see projects page content
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('can access new project page', async ({ page }) => {
    await page.goto(`${BASE_URL}/projects/new`);
    // Should see project creation form
    await expect(page.locator('input, textarea').first()).toBeVisible();
  });
});

test.describe('Clients Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('clients list loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/clients`);
    await expect(page).toHaveURL(/.*clients/);
  });
});

test.describe('Responsive Design', () => {
  test('login page works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/login`);

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('dashboard works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await login(page);

    // Dashboard should be accessible on mobile
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('navigation works on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await login(page);

    // Should be able to navigate
    await expect(page).toHaveURL(/.*dashboard/);
  });
});

test.describe('Billing Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('billing page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/settings/billing`);
    // Should see billing page content
    await expect(page.locator('text=/billing|subscription|plan/i').first()).toBeVisible();
  });
});

// Critical User Flow Tests
test.describe('Critical Flows', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('full login → dashboard → projects flow', async ({ page }) => {
    // Already logged in from beforeEach

    // Verify on dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Navigate to projects
    await page.click('text=Projects');
    await expect(page).toHaveURL(/.*projects/);

    // Navigate back to dashboard
    await page.click('text=Dashboard');
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
