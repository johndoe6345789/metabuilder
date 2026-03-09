/**
 * Playwright E2E tests using playbooks from features.json
 */
import { test, expect } from '@playwright/test';
import { getAllPlaywrightPlaybooks, type PlaywrightPlaybook, type PlaywrightStep } from '@/utils/featureConfig';

// Execute a single playbook step
async function executeStep(page: any, step: PlaywrightStep, variables: Record<string, string> = {}) {
  // Replace variables in step values
  const replaceVars = (value?: string) => {
    if (!value) return value;
    return Object.entries(variables).reduce((acc, [key, val]) => {
      return acc.replace(new RegExp(`{{${key}}}`, 'g'), val);
    }, value);
  };

  switch (step.action) {
    case 'goto':
      await page.goto(replaceVars(step.url));
      break;

    case 'click':
      await page.click(replaceVars(step.selector));
      break;

    case 'fill':
      await page.fill(replaceVars(step.selector), replaceVars(step.value) || '');
      break;

    case 'select':
      await page.selectOption(replaceVars(step.selector), replaceVars(step.value) || '');
      break;

    case 'wait':
      await page.waitForTimeout(step.timeout || 1000);
      break;

    case 'expect':
      if (step.text === 'visible' && step.selector) {
        await expect(page.locator(replaceVars(step.selector))).toBeVisible();
      } else if (step.text === 'redirected' && step.url) {
        await expect(page).toHaveURL(replaceVars(step.url));
      } else if (step.text && step.selector) {
        await expect(page.locator(replaceVars(step.selector))).toHaveText(replaceVars(step.text) || '');
      } else if (step.text === '401') {
        // Check for 401 status
        const response = await page.waitForResponse((resp: any) => resp.status() === 401);
        expect(response.status()).toBe(401);
      }
      break;

    case 'screenshot':
      if (step.selector) {
        await page.locator(replaceVars(step.selector)).screenshot();
      } else {
        await page.screenshot();
      }
      break;

    default:
      console.warn(`Unknown action: ${step.action}`);
  }
}

// Execute a full playbook
async function executePlaybook(page: any, playbook: PlaywrightPlaybook, variables: Record<string, string> = {}) {
  for (const step of playbook.steps) {
    await executeStep(page, step, variables);
  }
}

// Execute playbook cleanup steps
async function cleanupPlaybook(page: any, playbook: PlaywrightPlaybook, variables: Record<string, string> = {}) {
  if (playbook.cleanup) {
    for (const step of playbook.cleanup) {
      try {
        await executeStep(page, step, variables);
      } catch (err) {
        console.warn('Cleanup step failed:', err);
      }
    }
  }
}

// Load all playbooks
const playbooks = getAllPlaywrightPlaybooks();

// Test: API Security Check
test.describe('API Security', () => {
  const playbook = playbooks.securityCheck;
  
  if (playbook) {
    test(playbook.name, async ({ page }) => {
      await executePlaybook(page, playbook);
    });
  }
});

// Test: Query Builder
test.describe('Query Builder', () => {
  const playbook = playbooks.queryBuilder;
  
  if (playbook) {
    test.skip(playbook.name, async ({ page }) => {
      // This test requires authentication, skipping for now
      const variables = {
        tableName: 'users',
        columnName: 'id',
      };
      
      await executePlaybook(page, playbook, variables);
    });
  }
});

// Test: Create Table
test.describe('Table Management', () => {
  const playbook = playbooks.createTable;
  
  if (playbook) {
    test.skip(playbook.name, async ({ page }) => {
      // This test requires authentication, skipping for now
      const variables = {
        tableName: 'test_table_' + Date.now(),
      };
      
      await executePlaybook(page, playbook, variables);
      
      // Cleanup
      await cleanupPlaybook(page, playbook, variables);
    });
  }
});

// Test: Add Column
test.describe('Column Management', () => {
  const playbook = playbooks.addColumn;
  
  if (playbook) {
    test.skip(playbook.name, async ({ page }) => {
      // This test requires authentication and an existing table, skipping for now
      const variables = {
        tableName: 'users',
        columnName: 'test_column_' + Date.now(),
        dataType: 'VARCHAR',
      };
      
      await executePlaybook(page, playbook, variables);
    });
  }
});

// Test: Create Index
test.describe('Index Management', () => {
  const playbook = playbooks.createIndex;
  
  if (playbook) {
    test.skip(playbook.name, async ({ page }) => {
      // This test requires authentication and an existing table, skipping for now
      const variables = {
        tableName: 'users',
        columnName: 'id',
        indexName: 'idx_test_' + Date.now(),
      };
      
      await executePlaybook(page, playbook, variables);
    });
  }
});
