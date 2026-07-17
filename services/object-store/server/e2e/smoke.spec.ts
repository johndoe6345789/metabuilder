import { test, expect } from '@playwright/test';

/**
 * Smoke tests for the S3 server frontend.
 * Validates login page and bucket list rendering.
 */
test.describe('S3 Server Smoke Tests', () => {
  test('app loads successfully', async ({ page }) => {
    const response = await page.goto('/', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    expect(response?.status()).toBeLessThan(500);
    await expect(
      page.locator('body'),
    ).not.toBeEmpty();
  });

  test('login page renders', async ({ page }) => {
    await page.goto('/login', {
      waitUntil: 'domcontentloaded',
    });
    const form = page.getByTestId('login-form');
    await expect(form).toBeVisible();
  });

  test('login form has credentials fields', async ({
    page,
  }) => {
    await page.goto('/login', {
      waitUntil: 'domcontentloaded',
    });
    const key = page.getByTestId('access-key-input');
    const secret = page.getByTestId(
      'secret-key-input',
    );
    await expect(key).toBeVisible();
    await expect(secret).toBeVisible();
  });

  test('login form has submit button', async ({
    page,
  }) => {
    await page.goto('/login', {
      waitUntil: 'domcontentloaded',
    });
    const btn = page.getByTestId('login-submit');
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test('buckets page loads', async ({ page }) => {
    const response = await page.goto('/buckets', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    expect(response?.status()).toBeLessThan(500);
  });

  test('bucket list container renders', async ({
    page,
  }) => {
    await page.goto('/buckets', {
      waitUntil: 'domcontentloaded',
    });
    const list = page.getByTestId('bucket-list');
    await expect(list).toBeVisible();
  });
});
