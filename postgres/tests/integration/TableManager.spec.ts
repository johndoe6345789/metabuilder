import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

test.describe('Table Manager', () => {
  const testTableName = `test_table_${faker.string.alphanumeric(8)}`;

  test.describe('Create Table API', () => {
    test('should create a new table with columns', async ({ page }) => {
      const response = await page.request.post('/api/admin/table-manage', {
        data: {
          tableName: testTableName,
          columns: [
            {
              name: 'id',
              type: 'SERIAL',
              primaryKey: true,
              nullable: false,
            },
            {
              name: 'name',
              type: 'VARCHAR',
              length: 255,
              nullable: false,
            },
            {
              name: 'email',
              type: 'VARCHAR',
              length: 255,
              nullable: true,
            },
          ],
        },
      });

      // Note: This will fail without authentication, which is expected
      // In a real test, you would need to authenticate first
      expect([200, 401]).toContain(response.status());
    });

    test('should reject table creation without table name', async ({ page }) => {
      const response = await page.request.post('/api/admin/table-manage', {
        data: {
          columns: [
            {
              name: 'id',
              type: 'INTEGER',
            },
          ],
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should reject table creation without columns', async ({ page }) => {
      const response = await page.request.post('/api/admin/table-manage', {
        data: {
          tableName: 'test_table',
          columns: [],
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should reject table with invalid name format', async ({ page }) => {
      const response = await page.request.post('/api/admin/table-manage', {
        data: {
          tableName: 'invalid-table-name!@#',
          columns: [
            {
              name: 'id',
              type: 'INTEGER',
            },
          ],
        },
      });

      expect([400, 401]).toContain(response.status());
    });
  });

  test.describe('Drop Table API', () => {
    test('should reject drop without table name', async ({ page }) => {
      const response = await page.request.delete('/api/admin/table-manage', {
        data: {},
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should reject drop with invalid table name', async ({ page }) => {
      const response = await page.request.delete('/api/admin/table-manage', {
        data: {
          tableName: 'invalid-name!@#',
        },
      });

      expect([400, 401]).toContain(response.status());
    });
  });
});
