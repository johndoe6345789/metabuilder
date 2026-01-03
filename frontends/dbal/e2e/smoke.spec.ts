import { expect, test } from '@playwright/test';
import { getStatusResponse } from '../src/status';

const statusNames = getStatusResponse().statuses.map(({ name }) => name);

test('daemon page renders the observability feed', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Observability Feed/i })).toBeVisible();
  await expect(page.getByText('Server status')).toBeVisible();

  for (const name of statusNames) {
    await expect(page.getByRole('heading', { name })).toBeVisible();
  }

  await expect(page.locator('article')).toHaveCount(statusNames.length);
  await expect(page.getByText(/Updated/)).toBeVisible();
});

test('status API returns the same health feed that the UI displays', async ({ request }) => {
  const response = await request.get('/api/status');
  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  const apiNames = body.statuses?.map((entry: { name: string }) => entry.name) ?? [];
  expect(apiNames).toEqual(statusNames);
});
