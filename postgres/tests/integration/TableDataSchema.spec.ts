import { expect, test } from '@playwright/test';

test.describe('Table Data and Schema APIs', () => {
  test.describe('List Tables API', () => {
    test('should reject list tables without authentication', async ({ page }) => {
      const response = await page.request.get('/api/admin/tables');

      expect(response.status()).toBe(401);
    });
  });

  test.describe('Get Table Data API', () => {
    test('should reject get table data without authentication', async ({ page }) => {
      const response = await page.request.post('/api/admin/table-data', {
        data: {
          tableName: 'test_table',
        },
      });

      expect(response.status()).toBe(401);
    });

    test('should reject get table data without table name', async ({ page }) => {
      const response = await page.request.post('/api/admin/table-data', {
        data: {},
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should reject get table data with invalid table name', async ({ page }) => {
      const response = await page.request.post('/api/admin/table-data', {
        data: {
          tableName: 'invalid-table!@#',
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should accept pagination parameters', async ({ page }) => {
      const response = await page.request.post('/api/admin/table-data', {
        data: {
          tableName: 'test_table',
          page: 1,
          limit: 10,
        },
      });

      // Should either be 401 (no auth) or 404/500 (no table) but not 400 (valid parameters)
      expect([401, 404, 500, 200]).toContain(response.status());
    });
  });

  test.describe('Get Table Schema API', () => {
    test('should reject get table schema without authentication', async ({ page }) => {
      const response = await page.request.post('/api/admin/table-schema', {
        data: {
          tableName: 'test_table',
        },
      });

      expect(response.status()).toBe(401);
    });

    test('should reject get table schema without table name', async ({ page }) => {
      const response = await page.request.post('/api/admin/table-schema', {
        data: {},
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should reject get table schema with invalid table name', async ({ page }) => {
      const response = await page.request.post('/api/admin/table-schema', {
        data: {
          tableName: 'invalid!@#',
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should accept valid table name format', async ({ page }) => {
      const response = await page.request.post('/api/admin/table-schema', {
        data: {
          tableName: 'valid_table_name',
        },
      });

      // Should either be 401 (no auth) or 404/500 (no table) but not 400 (valid format)
      expect([401, 404, 500, 200]).toContain(response.status());
    });
  });
});
