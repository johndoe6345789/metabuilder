import { Page, expect } from '@playwright/test';
import { getAllPlaywrightPlaybooks, PlaywrightPlaybook, PlaywrightStep } from '@/utils/featureConfig';

/**
 * Execute a single Playwright step from a playbook
 */
export async function executeStep(page: Page, step: PlaywrightStep, variables: Record<string, string> = {}) {
  // Replace variables in step properties
  const replaceVars = (str: string | undefined): string => {
    if (!str) return '';
    return str.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || '');
  };

  const selector = replaceVars(step.selector);
  const value = replaceVars(step.value);
  const url = replaceVars(step.url);
  const text = replaceVars(step.text);

  switch (step.action) {
    case 'goto':
      if (url) {
        await page.goto(url);
      }
      break;

    case 'click':
      if (selector) {
        await page.click(selector);
      }
      break;

    case 'fill':
      if (selector && value) {
        await page.fill(selector, value);
      }
      break;

    case 'select':
      if (selector && value) {
        await page.selectOption(selector, value);
      }
      break;

    case 'wait':
      if (step.timeout) {
        await page.waitForTimeout(step.timeout);
      }
      break;

    case 'expect':
      if (url === 'redirected') {
        await expect(page).toHaveURL(new RegExp(selector || ''));
      } else if (text === 'visible' && selector) {
        await expect(page.locator(selector)).toBeVisible();
      } else if (text && selector) {
        await expect(page.locator(selector)).toContainText(text);
      } else if (text) {
        // Note: Status code checks require special handling in Playwright
        // They are not directly supported in playbooks and should be handled
        // with API route interception in custom tests
        console.warn('Status code checks should be implemented in custom test files, not playbooks');
      }
      break;

    case 'screenshot':
      // Generate unique filename with timestamp and random component
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const uniqueId = `${timestamp}-${random}`;
      
      if (selector) {
        // Sanitize selector for use in filename
        const safeSelector = selector
          .replace(/[^a-z0-9]/gi, '_')  // Replace non-alphanumeric with underscore
          .replace(/_+/g, '_')            // Replace multiple underscores with single
          .replace(/^_|_$/g, '');         // Remove leading/trailing underscores
        await page.locator(selector).screenshot({ 
          path: `screenshots/${uniqueId}-${safeSelector}.png` 
        });
      } else {
        await page.screenshot({ 
          path: `screenshots/${uniqueId}-page.png` 
        });
      }
      break;

    default:
      console.warn(`Unknown step action: ${step.action}`);
  }
}

/**
 * Execute a full playbook from features.json
 */
export async function runPlaybook(
  page: Page,
  playbookName: string,
  variables: Record<string, string> = {},
  options: { runCleanup?: boolean } = {}
) {
  const playbooks = getAllPlaywrightPlaybooks();
  const playbook = playbooks[playbookName];

  if (!playbook) {
    throw new Error(`Playbook not found: ${playbookName}`);
  }

  console.log(`Running playbook: ${playbook.name}`);
  console.log(`Description: ${playbook.description}`);

  // Execute main steps
  for (const step of playbook.steps) {
    await executeStep(page, step, variables);
  }

  // Execute cleanup steps if requested and they exist
  if (options.runCleanup && playbook.cleanup) {
    console.log('Running cleanup steps...');
    for (const step of playbook.cleanup) {
      await executeStep(page, step, variables);
    }
  }
}

/**
 * Get all playbooks by tag
 */
export function getPlaybooksByTag(tag: string): Record<string, PlaywrightPlaybook> {
  const allPlaybooks = getAllPlaywrightPlaybooks();
  const filtered: Record<string, PlaywrightPlaybook> = {};

  for (const [name, playbook] of Object.entries(allPlaybooks)) {
    if (playbook.tags?.includes(tag)) {
      filtered[name] = playbook;
    }
  }

  return filtered;
}

/**
 * List all available playbooks
 */
export function listPlaybooks(): string[] {
  return Object.keys(getAllPlaywrightPlaybooks());
}
