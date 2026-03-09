/**
 * WorkflowUI Integration Tests
 * End-to-end tests for workflow creation and execution
 * Tests both TypeScript and Python workflows with mock DBAL backend
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const WORKFLOWUI_URL = 'http://localhost:3000';
const MOCK_DBAL_URL = 'http://localhost:8080';
const TENANT_ID = 'test-tenant';

// Load test workflow definitions
const loadWorkflowDefinition = (filename: string) => {
  const filePath = path.join(__dirname, '../test-workflows', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

// Helper: Wait for element with retry
async function waitForElement(
  page: Page,
  selector: string,
  timeout = 10000
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout, state: 'visible' });
    return true;
  } catch (e) {
    return false;
  }
}

// Helper: Create workflow via API
async function createWorkflowViaAPI(workflowDef: any): Promise<string> {
  const response = await fetch(`${MOCK_DBAL_URL}/api/v1/${TENANT_ID}/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflowDef),
  });

  if (!response.ok) {
    throw new Error(`Failed to create workflow: ${response.statusText}`);
  }

  const workflow = await response.json();
  return workflow.id;
}

// Helper: Execute workflow via API
async function executeWorkflowViaAPI(workflowId: string): Promise<any> {
  const response = await fetch(
    `${MOCK_DBAL_URL}/api/v1/${TENANT_ID}/workflows/${workflowId}/execute`,
    { method: 'POST' }
  );

  if (!response.ok) {
    throw new Error(`Failed to execute workflow: ${response.statusText}`);
  }

  return response.json();
}

// Helper: Get execution status via API
async function getExecutionStatus(executionId: string): Promise<any> {
  const response = await fetch(
    `${MOCK_DBAL_URL}/api/v1/${TENANT_ID}/executions/${executionId}`
  );

  if (!response.ok) {
    throw new Error(`Failed to get execution: ${response.statusText}`);
  }

  return response.json();
}

// Helper: Wait for execution to complete
async function waitForExecutionComplete(executionId: string, maxWait = 10000): Promise<any> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    const execution = await getExecutionStatus(executionId);
    if (execution.status === 'success' || execution.status === 'error') {
      return execution;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error('Execution timeout');
}

test.describe('WorkflowUI Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Wait for mock DBAL to be ready
    await page.goto(MOCK_DBAL_URL + '/health');
    await expect(page.locator('pre')).toContainText('ok');
  });

  test('Mock DBAL server is running', async ({ page }) => {
    await page.goto(MOCK_DBAL_URL + '/health');
    const healthData = await page.locator('pre').textContent();
    expect(healthData).toContain('ok');
    console.log('✓ Mock DBAL server health check passed');
  });

  test('WorkflowUI loads successfully', async ({ page }) => {
    await page.goto(WORKFLOWUI_URL);
    await expect(page).toHaveTitle(/WorkflowUI|MetaBuilder/);
    console.log('✓ WorkflowUI loaded successfully');
  });

  test('TypeScript Math Workflow - Full E2E', async ({ page }) => {
    console.log('\n=== TypeScript Math Workflow Test ===');

    // Load workflow definition
    const workflowDef = loadWorkflowDefinition('typescript-math.json');
    console.log(`Loaded workflow: ${workflowDef.name}`);

    // Create workflow via API
    const workflowId = await createWorkflowViaAPI(workflowDef);
    console.log(`Created workflow ID: ${workflowId}`);

    // Navigate to workflow editor
    await page.goto(`${WORKFLOWUI_URL}/editor/${workflowId}`);
    console.log('Navigated to workflow editor');

    // Wait for editor to load
    const editorLoaded = await waitForElement(page, '[class*="editor"]', 15000);
    expect(editorLoaded).toBe(true);
    console.log('✓ Editor loaded');

    // Take screenshot of workflow
    await page.screenshot({
      path: path.join(__dirname, '../test-results/typescript-workflow-editor.png'),
      fullPage: true,
    });
    console.log('✓ Screenshot captured: typescript-workflow-editor.png');

    // Execute workflow via API
    const execution = await executeWorkflowViaAPI(workflowId);
    console.log(`Started execution: ${execution.id}`);

    // Wait for execution to complete
    const completedExecution = await waitForExecutionComplete(execution.id);
    console.log('✓ Execution completed');

    // Verify execution results
    expect(completedExecution.status).toBe('success');
    expect(completedExecution.outputs.result).toBe(workflowDef.expectedOutput);
    console.log(`✓ Execution result: ${completedExecution.outputs.result}`);
    console.log('✓ Expected result: ' + workflowDef.expectedOutput);

    // Verify node results
    for (const [nodeId, expectedOutput] of Object.entries(
      workflowDef.expectedNodeResults
    )) {
      const nodeResult = completedExecution.nodeResults[nodeId];
      expect(nodeResult).toBeDefined();
      expect(nodeResult.status).toBe('success');
      console.log(`✓ Node ${nodeId}: ${JSON.stringify(nodeResult.output)}`);
    }

    console.log('✅ TypeScript Math Workflow - PASSED\n');
  });

  test('Python Data Processing Workflow - Full E2E', async ({ page }) => {
    console.log('\n=== Python Data Processing Workflow Test ===');

    // Load workflow definition
    const workflowDef = loadWorkflowDefinition('python-data.json');
    console.log(`Loaded workflow: ${workflowDef.name}`);

    // Create workflow via API
    const workflowId = await createWorkflowViaAPI(workflowDef);
    console.log(`Created workflow ID: ${workflowId}`);

    // Navigate to workflow editor
    await page.goto(`${WORKFLOWUI_URL}/editor/${workflowId}`);
    console.log('Navigated to workflow editor');

    // Wait for editor to load
    const editorLoaded = await waitForElement(page, '[class*="editor"]', 15000);
    expect(editorLoaded).toBe(true);
    console.log('✓ Editor loaded');

    // Take screenshot
    await page.screenshot({
      path: path.join(__dirname, '../test-results/python-workflow-editor.png'),
      fullPage: true,
    });
    console.log('✓ Screenshot captured: python-workflow-editor.png');

    // Execute workflow via API
    const execution = await executeWorkflowViaAPI(workflowId);
    console.log(`Started execution: ${execution.id}`);

    // Wait for execution to complete
    const completedExecution = await waitForExecutionComplete(execution.id);
    console.log('✓ Execution completed');

    // Verify execution results
    expect(completedExecution.status).toBe('success');
    expect(completedExecution.outputs.result).toBe(workflowDef.expectedOutput);
    console.log(`✓ Execution result: ${completedExecution.outputs.result}`);
    console.log('✓ Expected result: ' + workflowDef.expectedOutput);

    // Verify node results
    const nodeIds = Object.keys(workflowDef.expectedNodeResults);
    for (const nodeId of nodeIds) {
      const nodeResult = completedExecution.nodeResults[nodeId];
      expect(nodeResult).toBeDefined();
      expect(nodeResult.status).toBe('success');
      console.log(`✓ Node ${nodeId}: Success`);
    }

    console.log('✅ Python Data Processing Workflow - PASSED\n');
  });

  test('Workflow Execution History', async ({ page }) => {
    console.log('\n=== Workflow Execution History Test ===');

    // Create a simple workflow
    const workflowDef = loadWorkflowDefinition('typescript-math.json');
    const workflowId = await createWorkflowViaAPI(workflowDef);

    // Execute multiple times
    const executionIds: string[] = [];
    for (let i = 0; i < 3; i++) {
      const execution = await executeWorkflowViaAPI(workflowId);
      executionIds.push(execution.id);
      await waitForExecutionComplete(execution.id);
    }

    console.log(`✓ Executed workflow 3 times: ${executionIds.join(', ')}`);

    // Verify execution history via API
    const response = await fetch(
      `${MOCK_DBAL_URL}/api/v1/${TENANT_ID}/workflows/${workflowId}/executions`
    );
    const { executions, total } = await response.json();

    expect(total).toBe(3);
    expect(executions.length).toBe(3);
    console.log(`✓ Execution history contains ${total} executions`);

    // All executions should be successful
    for (const exec of executions) {
      expect(exec.status).toBe('success');
    }
    console.log('✓ All executions successful');

    console.log('✅ Workflow Execution History - PASSED\n');
  });

  test('Plugin API Endpoint', async ({ page }) => {
    console.log('\n=== Plugin API Endpoint Test ===');

    await page.goto(`${WORKFLOWUI_URL}/api/plugins`);
    const content = await page.locator('pre').textContent();
    const pluginData = JSON.parse(content || '{}');

    // Verify structure
    expect(pluginData).toHaveProperty('categories');
    expect(pluginData).toHaveProperty('nodes');
    expect(pluginData).toHaveProperty('languages');
    expect(pluginData).toHaveProperty('totalNodes');

    console.log(`✓ Total nodes: ${pluginData.totalNodes}`);
    console.log(`✓ Languages: ${pluginData.languages.join(', ')}`);
    console.log(`✓ Categories: ${pluginData.categories.length}`);

    // Verify language health
    expect(pluginData.languageHealth).toHaveProperty('ts');
    expect(pluginData.languageHealth.ts).toBe(true);
    console.log('✓ TypeScript language health: OK');

    console.log('✅ Plugin API Endpoint - PASSED\n');
  });
});
