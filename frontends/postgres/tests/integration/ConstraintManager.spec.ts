import { expect, test } from '@playwright/test';

test.describe('Constraint Manager', () => {
  test.describe('List Constraints API', () => {
    test('should reject list constraints without authentication', async ({ page }) => {
      const response = await page.request.get('/api/admin/constraints?tableName=test_table');
      
      expect(response.status()).toBe(401);
    });

    test('should reject list constraints without table name', async ({ page }) => {
      const response = await page.request.get('/api/admin/constraints');
      
      expect([400, 401]).toContain(response.status());
    });

    test('should reject list constraints with invalid table name', async ({ page }) => {
      const response = await page.request.get('/api/admin/constraints?tableName=invalid-table!@#');
      
      expect([400, 401]).toContain(response.status());
    });
  });

  test.describe('Add Constraint API', () => {
    test('should reject add constraint without authentication', async ({ page }) => {
      const response = await page.request.post('/api/admin/constraints', {
        data: {
          tableName: 'test_table',
          constraintName: 'unique_email',
          constraintType: 'UNIQUE',
          columnName: 'email',
        },
      });
      
      expect(response.status()).toBe(401);
    });

    test('should reject add constraint without required fields', async ({ page }) => {
      const response = await page.request.post('/api/admin/constraints', {
        data: {
          tableName: 'test_table',
        },
      });
      
      expect([400, 401]).toContain(response.status());
    });

    test('should reject add constraint with invalid table name', async ({ page }) => {
      const response = await page.request.post('/api/admin/constraints', {
        data: {
          tableName: 'invalid-table!@#',
          constraintName: 'test_constraint',
          constraintType: 'UNIQUE',
          columnName: 'email',
        },
      });
      
      expect([400, 401]).toContain(response.status());
    });

    test('should reject PRIMARY KEY constraint without column name', async ({ page }) => {
      const response = await page.request.post('/api/admin/constraints', {
        data: {
          tableName: 'test_table',
          constraintName: 'test_pk',
          constraintType: 'PRIMARY KEY',
        },
      });
      
      expect([400, 401]).toContain(response.status());
    });

    test('should reject UNIQUE constraint without column name', async ({ page }) => {
      const response = await page.request.post('/api/admin/constraints', {
        data: {
          tableName: 'test_table',
          constraintName: 'test_unique',
          constraintType: 'UNIQUE',
        },
      });
      
      expect([400, 401]).toContain(response.status());
    });

    test('should reject CHECK constraint without expression', async ({ page }) => {
      const response = await page.request.post('/api/admin/constraints', {
        data: {
          tableName: 'test_table',
          constraintName: 'test_check',
          constraintType: 'CHECK',
        },
      });
      
      expect([400, 401]).toContain(response.status());
    });

    test('should reject CHECK constraint with dangerous expression', async ({ page }) => {
      const response = await page.request.post('/api/admin/constraints', {
        data: {
          tableName: 'test_table',
          constraintName: 'test_check',
          constraintType: 'CHECK',
          checkExpression: 'age > 0; DROP TABLE test',
        },
      });
      
      expect([400, 401]).toContain(response.status());
    });

    test('should reject unsupported constraint type', async ({ page }) => {
      const response = await page.request.post('/api/admin/constraints', {
        data: {
          tableName: 'test_table',
          constraintName: 'test_fk',
          constraintType: 'FOREIGN_KEY',
        },
      });
      
      expect([400, 401]).toContain(response.status());
    });
  });

  test.describe('Drop Constraint API', () => {
    test('should reject drop constraint without authentication', async ({ page }) => {
      const response = await page.request.delete('/api/admin/constraints', {
        data: {
          tableName: 'test_table',
          constraintName: 'unique_email',
        },
      });
      
      expect(response.status()).toBe(401);
    });

    test('should reject drop constraint without required fields', async ({ page }) => {
      const response = await page.request.delete('/api/admin/constraints', {
        data: {
          tableName: 'test_table',
        },
      });
      
      expect([400, 401]).toContain(response.status());
    });

    test('should reject drop constraint with invalid identifiers', async ({ page }) => {
      const response = await page.request.delete('/api/admin/constraints', {
        data: {
          tableName: 'invalid!@#',
          constraintName: 'invalid!@#',
        },
      });
      
      expect([400, 401]).toContain(response.status());
    });
  });
});
