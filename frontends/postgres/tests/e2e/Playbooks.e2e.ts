import { test, expect } from '@playwright/test';
import { runPlaybook, listPlaybooks, getPlaybooksByTag } from '../utils/playbookRunner';

/**
 * Example test using playbookRunner to execute tests from features.json
 */

test.describe('Playbook-driven tests', () => {
  test('should list available playbooks', () => {
    const playbooks = listPlaybooks();
    
    expect(playbooks).toBeDefined();
    expect(playbooks.length).toBeGreaterThan(0);
    
    // Check for expected playbooks from features.json
    expect(playbooks).toContain('adminLogin');
    expect(playbooks).toContain('createTable');
    expect(playbooks).toContain('queryBuilder');
  });

  test('should filter playbooks by tag', () => {
    const adminPlaybooks = getPlaybooksByTag('admin');
    
    expect(Object.keys(adminPlaybooks).length).toBeGreaterThan(0);
    
    // All returned playbooks should have the 'admin' tag
    for (const playbook of Object.values(adminPlaybooks)) {
      expect(playbook.tags).toContain('admin');
    }
  });

  // Example test using a playbook from features.json
  test.skip('should execute query builder playbook', async ({ page }) => {
    // Note: This test is skipped as it requires a running application
    // To enable, remove test.skip and ensure the app is running
    
    await runPlaybook(page, 'queryBuilder', {
      tableName: 'users',
      columnName: 'name',
    });
    
    // The playbook includes assertions, so if we get here, the test passed
    expect(true).toBe(true);
  });
});

/**
 * These tests demonstrate the playbook system but are skipped by default
 * because they require a running application. In a real CI/CD environment,
 * you would remove the .skip and ensure the app is running before tests.
 */
test.describe.skip('Full playbook integration tests', () => {
  test('admin login flow', async ({ page }) => {
    await runPlaybook(page, 'adminLogin', {
      username: 'admin',
      password: 'testpassword',
    });
  });

  test('create table workflow', async ({ page }) => {
    await runPlaybook(page, 'createTable', {
      tableName: 'test_table_' + Date.now(),
    }, { runCleanup: true });
  });

  test('add column workflow', async ({ page }) => {
    await runPlaybook(page, 'addColumn', {
      tableName: 'users',
      columnName: 'test_column',
      dataType: 'VARCHAR',
    });
  });

  test('create index workflow', async ({ page }) => {
    await runPlaybook(page, 'createIndex', {
      tableName: 'users',
      indexName: 'idx_test_' + Date.now(),
      columnName: 'name',
    });
  });
});
