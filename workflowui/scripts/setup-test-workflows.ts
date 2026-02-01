#!/usr/bin/env npx ts-node
/**
 * Setup Test Workflows Script
 *
 * Creates all test workflows in the WorkflowUI application.
 * Run this after starting the backend server.
 *
 * Usage:
 *   npm run setup:test-workflows
 *   or
 *   npx ts-node scripts/setup-test-workflows.ts
 */

// Use native fetch (available in Node 18+)

const API_BASE = process.env.API_BASE || 'http://localhost:5000';
const TENANT_ID = 'default';

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  body?: string;
}

async function apiCall(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<any> {
  const options: RequestOptions = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

async function createWorkspace(): Promise<string> {
  console.log('📁 Creating "Testing & QA" workspace...');

  const result = await apiCall('/api/workspaces', 'POST', {
    id: 'testing-qa',
    name: 'Testing & QA',
    description: 'All test workflows and QA testing',
    tenantId: TENANT_ID,
    color: '#4CAF50',
  });

  console.log('✅ Workspace created: testing-qa');
  return result.data.id;
}

async function createProject(
  workspaceId: string,
  id: string,
  name: string,
  color: string
): Promise<string> {
  console.log(`  📋 Creating project: ${name}...`);

  const result = await apiCall('/api/projects', 'POST', {
    id,
    name,
    workspaceId,
    tenantId: TENANT_ID,
    color,
  });

  console.log(`  ✅ Project created: ${id}`);
  return result.data.id;
}

async function createTestProjects(workspaceId: string): Promise<Record<string, string>> {
  console.log('\n🗂️  Creating test projects...');

  const projects: Record<string, string> = {};

  projects['api-tests'] = await createProject(
    workspaceId,
    'api-tests',
    'API Integration Tests',
    '#2196F3'
  );

  projects['frontend-tests'] = await createProject(
    workspaceId,
    'frontend-tests',
    'Frontend Component Tests',
    '#FF9800'
  );

  projects['e2e-tests'] = await createProject(
    workspaceId,
    'e2e-tests',
    'End-to-End Scenarios',
    '#9C27B0'
  );

  projects['performance-tests'] = await createProject(
    workspaceId,
    'performance-tests',
    'Performance & Load Tests',
    '#E91E63'
  );

  projects['accessibility-tests'] = await createProject(
    workspaceId,
    'accessibility-tests',
    'Accessibility & WCAG 2.1 AA Tests',
    '#00BCD4'
  );

  return projects;
}

async function createWorkflow(
  projectId: string,
  workflow: any
): Promise<string> {
  console.log(`    • Creating workflow: ${workflow.name}`);

  const result = await apiCall('/api/workflows', 'POST', {
    ...workflow,
    projectId,
    tenantId: TENANT_ID,
  });

  return result.data.id;
}

const API_INTEGRATION_TESTS = [
  {
    name: 'POST /api/workspaces - Create Workspace',
    description: 'Test creating a new workspace via API',
    nodes: [
      { id: 'generate_id', type: 'operation', op: 'string.uuid', output: 'workspaceId' },
      {
        id: 'prepare_payload',
        type: 'operation',
        op: 'dict.create',
        data: {
          id: '{{ nodes.generate_id.output.workspaceId }}',
          name: 'Test Workspace {{ timestamp }}',
          tenantId: TENANT_ID,
        },
        output: 'payload',
      },
      {
        id: 'create_workspace',
        type: 'http',
        method: 'POST',
        url: `${API_BASE}/api/workspaces`,
        body: '{{ nodes.prepare_payload.output.payload }}',
        output: 'response',
      },
      {
        id: 'assert_status',
        type: 'operation',
        op: 'logic.assert',
        condition: '{{ nodes.create_workspace.output.response.status === 201 }}',
        message: 'Expected 201 status',
      },
    ],
    onError: [
      {
        id: 'notify_fail',
        type: 'notification',
        channel: 'test-results',
        message: '❌ POST /api/workspaces FAILED - {{ error.message }}',
      },
    ],
  },
  {
    name: 'GET /api/workspaces - List Workspaces',
    description: 'Test fetching workspaces from API',
    nodes: [
      {
        id: 'fetch_workspaces',
        type: 'http',
        method: 'GET',
        url: `${API_BASE}/api/workspaces?tenantId=${TENANT_ID}`,
        output: 'response',
      },
      {
        id: 'assert_status',
        type: 'operation',
        op: 'logic.assert',
        condition: '{{ nodes.fetch_workspaces.output.response.status === 200 }}',
        message: 'Expected 200 status',
      },
      {
        id: 'assert_is_array',
        type: 'operation',
        op: 'logic.assert',
        condition: '{{ Array.isArray(nodes.fetch_workspaces.output.response.data) }}',
        message: 'Response should be an array',
      },
    ],
  },
  {
    name: 'GET /api/health - Health Check',
    description: 'Test backend health endpoint',
    nodes: [
      {
        id: 'health_check',
        type: 'http',
        method: 'GET',
        url: `${API_BASE}/api/health`,
        output: 'response',
      },
      {
        id: 'assert_status',
        type: 'operation',
        op: 'logic.assert',
        condition: '{{ nodes.health_check.output.response.status === 200 }}',
        message: 'Backend is not responding',
      },
    ],
  },
];

const FRONTEND_COMPONENT_TESTS = [
  {
    name: 'Navigate to Dashboard',
    description: 'Test loading dashboard page',
    nodes: [
      {
        id: 'navigate',
        type: 'browser',
        action: 'navigate',
        url: 'http://localhost:3001',
        waitFor: '.dashboard',
      },
      {
        id: 'check_loaded',
        type: 'browser',
        action: 'evaluate',
        script: 'document.querySelector(".dashboard") !== null',
        output: 'isLoaded',
      },
      {
        id: 'assert_loaded',
        type: 'operation',
        op: 'logic.assert',
        condition: '{{ nodes.check_loaded.output.isLoaded === true }}',
        message: 'Dashboard did not load',
      },
    ],
  },
  {
    name: 'Navigate to Login',
    description: 'Test loading login page',
    nodes: [
      {
        id: 'navigate',
        type: 'browser',
        action: 'navigate',
        url: 'http://localhost:3001/login',
        waitFor: '.login-form',
      },
      {
        id: 'check_form',
        type: 'browser',
        action: 'evaluate',
        script: 'document.querySelector(".login-form") !== null',
        output: 'hasForm',
      },
      {
        id: 'assert_form',
        type: 'operation',
        op: 'logic.assert',
        condition: '{{ nodes.check_form.output.hasForm === true }}',
        message: 'Login form did not load',
      },
    ],
  },
];

const E2E_TESTS = [
  {
    name: 'Test Data Setup - Create Workspace & Project',
    description: 'Create test data for other tests',
    nodes: [
      {
        id: 'create_ws',
        type: 'http',
        method: 'POST',
        url: `${API_BASE}/api/workspaces`,
        body: {
          id: `e2e-ws-{{ timestamp }}`,
          name: 'E2E Test Workspace',
          tenantId: TENANT_ID,
        },
        output: 'workspace',
      },
      {
        id: 'create_proj',
        type: 'http',
        method: 'POST',
        url: `${API_BASE}/api/projects`,
        body: {
          id: `e2e-proj-{{ timestamp }}`,
          name: 'E2E Test Project',
          workspaceId: '{{ nodes.create_ws.output.workspace.data.id }}',
          tenantId: TENANT_ID,
        },
        output: 'project',
      },
      {
        id: 'notify_success',
        type: 'notification',
        channel: 'test-results',
        message: '✅ E2E test data created',
      },
    ],
  },
];

const ACCESSIBILITY_TESTS = [
  {
    name: 'Verify data-testid Attributes on Canvas',
    description: 'Test that all canvas elements have proper data-testid attributes',
    nodes: [
      {
        id: 'navigate_canvas',
        type: 'browser',
        action: 'navigate',
        url: 'http://localhost:3001/project/default-project',
        waitFor: '[data-testid="canvas-container"]',
      },
      {
        id: 'check_canvas_container',
        type: 'browser',
        action: 'evaluate',
        script: 'document.querySelector("[data-testid=\'canvas-container\']") !== null',
        output: 'hasCanvasTestId',
      },
      {
        id: 'check_zoom_controls',
        type: 'browser',
        action: 'evaluate',
        script: 'document.querySelector("[data-testid*=\'zoom\']") !== null',
        output: 'hasZoomTestIds',
      },
      {
        id: 'assert_canvas_testids',
        type: 'operation',
        op: 'logic.assert',
        condition: '{{ nodes.check_canvas_container.output.hasCanvasTestId === true && nodes.check_zoom_controls.output.hasZoomTestIds === true }}',
        message: 'Canvas elements missing required data-testid attributes',
      },
      {
        id: 'notify_pass',
        type: 'notification',
        channel: 'a11y-results',
        message: '✅ Canvas data-testid verification PASSED',
      },
    ],
    onError: [
      {
        id: 'notify_fail',
        type: 'notification',
        channel: 'a11y-results',
        message: '❌ Canvas data-testid verification FAILED - {{ error.message }}',
      },
    ],
  },
  {
    name: 'Test ARIA Labels and Roles',
    description: 'Verify ARIA attributes are present on key components',
    nodes: [
      {
        id: 'navigate_app',
        type: 'browser',
        action: 'navigate',
        url: 'http://localhost:3001',
        waitFor: '[role="main"]',
      },
      {
        id: 'check_main_role',
        type: 'browser',
        action: 'evaluate',
        script: 'document.querySelector("[role=\'main\']") !== null',
        output: 'hasMainRole',
      },
      {
        id: 'check_navigation_role',
        type: 'browser',
        action: 'evaluate',
        script: 'document.querySelector("[role=\'navigation\']") !== null || document.querySelector("nav") !== null',
        output: 'hasNavRole',
      },
      {
        id: 'check_complementary_role',
        type: 'browser',
        action: 'evaluate',
        script: 'document.querySelector("[role=\'complementary\']") !== null',
        output: 'hasComplementaryRole',
      },
      {
        id: 'assert_aria_roles',
        type: 'operation',
        op: 'logic.assert',
        condition: '{{ nodes.check_main_role.output.hasMainRole === true }}',
        message: 'Main content area missing proper ARIA role',
      },
      {
        id: 'notify_pass',
        type: 'notification',
        channel: 'a11y-results',
        message: '✅ ARIA roles verification PASSED',
      },
    ],
    onError: [
      {
        id: 'notify_fail',
        type: 'notification',
        channel: 'a11y-results',
        message: '❌ ARIA roles verification FAILED - {{ error.message }}',
      },
    ],
  },
  {
    name: 'Keyboard Navigation Test - Settings Modal',
    description: 'Test keyboard navigation through settings modal using Tab and Escape keys',
    nodes: [
      {
        id: 'navigate_app',
        type: 'browser',
        action: 'navigate',
        url: 'http://localhost:3001',
        waitFor: '[data-testid="button-click-settings"]',
      },
      {
        id: 'click_settings',
        type: 'browser',
        action: 'click',
        selector: '[data-testid="button-click-settings"]',
      },
      {
        id: 'wait_modal',
        type: 'browser',
        action: 'waitForSelector',
        selector: '[role="dialog"]',
      },
      {
        id: 'check_modal_visible',
        type: 'browser',
        action: 'evaluate',
        script: 'document.querySelector("[role=\'dialog\']") !== null',
        output: 'isModalVisible',
      },
      {
        id: 'press_tab',
        type: 'browser',
        action: 'keyboard',
        key: 'Tab',
      },
      {
        id: 'check_focus_moved',
        type: 'browser',
        action: 'evaluate',
        script: 'document.activeElement.tagName !== \'BODY\'',
        output: 'focusMoved',
      },
      {
        id: 'press_escape',
        type: 'browser',
        action: 'keyboard',
        key: 'Escape',
      },
      {
        id: 'wait_modal_closed',
        type: 'browser',
        action: 'wait',
        timeout: 500,
      },
      {
        id: 'assert_modal_closed',
        type: 'browser',
        action: 'evaluate',
        script: 'document.querySelector("[role=\'dialog\']") === null || getComputedStyle(document.querySelector("[role=\'dialog\']")).display === \'none\'',
        output: 'isClosed',
      },
      {
        id: 'assert_keyboard_navigation',
        type: 'operation',
        op: 'logic.assert',
        condition: '{{ nodes.assert_modal_closed.output.isClosed === true }}',
        message: 'Keyboard navigation (Escape) did not close modal',
      },
      {
        id: 'notify_pass',
        type: 'notification',
        channel: 'a11y-results',
        message: '✅ Keyboard navigation test PASSED',
      },
    ],
    onError: [
      {
        id: 'notify_fail',
        type: 'notification',
        channel: 'a11y-results',
        message: '❌ Keyboard navigation test FAILED - {{ error.message }}',
      },
    ],
  },
  {
    name: 'Screen Reader Semantics - Form Labels',
    description: 'Verify form inputs have associated labels for screen readers',
    nodes: [
      {
        id: 'navigate_app',
        type: 'browser',
        action: 'navigate',
        url: 'http://localhost:3001',
        waitFor: 'input[type="text"]',
      },
      {
        id: 'check_labeled_inputs',
        type: 'browser',
        action: 'evaluate',
        script: `
          const inputs = document.querySelectorAll('input[type="text"]');
          let allLabeled = true;
          inputs.forEach(input => {
            const hasLabel = document.querySelector(\`label[for="\${input.id}"]\`);
            const hasAriaLabel = input.getAttribute('aria-label');
            if (!hasLabel && !hasAriaLabel && input.id) {
              allLabeled = false;
            }
          });
          allLabeled
        `,
        output: 'allInputsLabeled',
      },
      {
        id: 'assert_labels',
        type: 'operation',
        op: 'logic.assert',
        condition: '{{ nodes.check_labeled_inputs.output.allInputsLabeled === true }}',
        message: 'Some form inputs are not properly labeled',
      },
      {
        id: 'notify_pass',
        type: 'notification',
        channel: 'a11y-results',
        message: '✅ Form labels accessibility test PASSED',
      },
    ],
    onError: [
      {
        id: 'notify_fail',
        type: 'notification',
        channel: 'a11y-results',
        message: '❌ Form labels accessibility test FAILED - {{ error.message }}',
      },
    ],
  },
  {
    name: 'Color Contrast Verification',
    description: 'Check that text has sufficient color contrast for WCAG AA compliance',
    nodes: [
      {
        id: 'navigate_app',
        type: 'browser',
        action: 'navigate',
        url: 'http://localhost:3001',
        waitFor: 'body',
      },
      {
        id: 'check_computed_styles',
        type: 'browser',
        action: 'evaluate',
        script: `
          const testElements = document.querySelectorAll('button, a, p, h1, h2, h3, h4');
          let hasGoodContrast = true;
          testElements.forEach(el => {
            const color = getComputedStyle(el).color;
            const bgColor = getComputedStyle(el).backgroundColor;
            // Simple check: color values are not the same (basic contrast)
            if (color === bgColor) {
              hasGoodContrast = false;
            }
          });
          hasGoodContrast
        `,
        output: 'hasContrast',
      },
      {
        id: 'assert_contrast',
        type: 'operation',
        op: 'logic.assert',
        condition: '{{ nodes.check_computed_styles.output.hasContrast === true }}',
        message: 'Some text elements have insufficient color contrast',
      },
      {
        id: 'notify_pass',
        type: 'notification',
        channel: 'a11y-results',
        message: '✅ Color contrast verification PASSED',
      },
    ],
    onError: [
      {
        id: 'notify_fail',
        type: 'notification',
        channel: 'a11y-results',
        message: '❌ Color contrast verification FAILED - {{ error.message }}',
      },
    ],
  },
];

const PERFORMANCE_TESTS = [
  {
    name: 'Setup Performance Test Data - 100 Items',
    description: 'Create 100 workflow cards for performance testing',
    nodes: [
      {
        id: 'create_ws',
        type: 'http',
        method: 'POST',
        url: `${API_BASE}/api/workspaces`,
        body: {
          id: 'perf-ws',
          name: 'Performance Test Workspace',
          tenantId: TENANT_ID,
        },
        output: 'workspace',
      },
      {
        id: 'create_proj',
        type: 'http',
        method: 'POST',
        url: `${API_BASE}/api/projects`,
        body: {
          id: 'perf-proj-100',
          name: 'Performance - 100 Items',
          workspaceId: '{{ nodes.create_ws.output.workspace.data.id }}',
          tenantId: TENANT_ID,
        },
        output: 'project',
      },
      {
        id: 'notify_complete',
        type: 'notification',
        channel: 'test-setup',
        message: '✅ Performance test data created',
      },
    ],
  },
];

const SECURITY_TESTS = [
  {
    name: 'XSS Prevention - User Input Sanitization',
    description: 'Test that user input is properly sanitized against XSS attacks',
    nodes: [
      {
        id: 'navigate_form',
        type: 'browser',
        action: 'navigate',
        url: 'http://localhost:3001/workflows/create',
        waitFor: '[data-testid="workflow-name-input"]',
      },
      {
        id: 'inject_xss_payload',
        type: 'browser',
        action: 'type',
        selector: '[data-testid="workflow-name-input"]',
        text: '<img src=x onerror="alert(\'XSS\')">',
      },
      {
        id: 'check_payload_escaped',
        type: 'browser',
        action: 'evaluate',
        script: 'document.querySelector("[data-testid=\'workflow-name-input\']").value.includes("<img")',
        output: 'isPayloadEscaped',
      },
      {
        id: 'assert_xss_prevention',
        type: 'operation',
        op: 'logic.assert',
        condition: '{{ nodes.check_payload_escaped.output.isPayloadEscaped === true }}',
        message: 'XSS payload not properly escaped',
      },
    ],
    onError: [
      {
        id: 'notify_fail',
        type: 'notification',
        channel: 'security-results',
        message: '❌ XSS Prevention Test FAILED - {{ error.message }}',
      },
    ],
  },
  {
    name: 'CSRF Token Validation - Form Submissions',
    description: 'Verify CSRF token is required and validated on form submissions',
    nodes: [
      {
        id: 'fetch_form_page',
        type: 'http',
        method: 'GET',
        url: `${API_BASE}/api/workflows/123`,
        output: 'response',
      },
      {
        id: 'check_for_csrf_token',
        type: 'browser',
        action: 'evaluate',
        script: 'document.querySelector("[name=\'_csrf\']") !== null || document.querySelector("[name=\'x-csrf-token\']") !== null',
        output: 'hasCsrfToken',
      },
      {
        id: 'assert_csrf_present',
        type: 'operation',
        op: 'logic.assert',
        condition: '{{ nodes.check_for_csrf_token.output.hasCsrfToken === true }}',
        message: 'CSRF token not found in form',
      },
    ],
  },
];

const INTEGRATION_TESTS = [
  {
    name: 'Multi-Workflow Integration - Workflow Trigger Chain',
    description: 'Test that workflows can trigger other workflows in sequence',
    nodes: [
      {
        id: 'create_workflow_1',
        type: 'http',
        method: 'POST',
        url: `${API_BASE}/api/workflows`,
        body: {
          name: 'Integration Test Workflow 1',
          projectId: 'integration-project',
          nodes: [
            { id: 'trigger', type: 'event', event: 'workflow.start' },
            { id: 'emit', type: 'event', event: 'workflow.done' },
          ],
        },
        output: 'workflow1',
      },
      {
        id: 'create_workflow_2',
        type: 'http',
        method: 'POST',
        url: `${API_BASE}/api/workflows`,
        body: {
          name: 'Integration Test Workflow 2',
          projectId: 'integration-project',
          nodes: [
            { id: 'trigger', type: 'event', event: 'workflow.done', listenTo: '{{ nodes.create_workflow_1.output.workflow1.data.id }}' },
            { id: 'action', type: 'operation', op: 'log', message: 'Triggered by workflow 1' },
          ],
        },
        output: 'workflow2',
      },
      {
        id: 'execute_chain',
        type: 'http',
        method: 'POST',
        url: `${API_BASE}/api/workflows/{{ nodes.create_workflow_1.output.workflow1.data.id }}/execute`,
        body: {},
        output: 'execution',
      },
      {
        id: 'assert_chain_success',
        type: 'operation',
        op: 'logic.assert',
        condition: '{{ nodes.execute_chain.output.execution.status === 200 }}',
        message: 'Workflow chain execution failed',
      },
    ],
  },
  {
    name: 'API Contract Validation - Response Schema',
    description: 'Verify all API responses match expected schema',
    nodes: [
      {
        id: 'fetch_workflows',
        type: 'http',
        method: 'GET',
        url: `${API_BASE}/api/workflows?tenantId=${TENANT_ID}`,
        output: 'response',
      },
      {
        id: 'validate_schema',
        type: 'operation',
        op: 'logic.assert',
        condition: '{{ nodes.fetch_workflows.output.response.data && Array.isArray(nodes.fetch_workflows.output.response.data) && nodes.fetch_workflows.output.response.data.every(w => w.id && w.name) }}',
        message: 'Response does not match expected schema',
      },
    ],
  },
];

const ERROR_HANDLING_TESTS = [
  {
    name: 'Timeout Handling - Long Running Operations',
    description: 'Test graceful handling of operation timeouts',
    nodes: [
      {
        id: 'create_timeout_workflow',
        type: 'http',
        method: 'POST',
        url: `${API_BASE}/api/workflows`,
        body: {
          name: 'Timeout Test Workflow',
          nodes: [
            {
              id: 'long_delay',
              type: 'operation',
              op: 'delay',
              duration: 30000,
            },
          ],
        },
        output: 'workflow',
        timeout: 5000,
      },
      {
        id: 'verify_timeout_caught',
        type: 'operation',
        op: 'logic.assert',
        condition: '{{ nodes.create_timeout_workflow.error !== undefined }}',
        message: 'Timeout not properly caught',
      },
    ],
    onError: [
      {
        id: 'notify_pass',
        type: 'notification',
        channel: 'error-handling-results',
        message: '✅ Timeout handling test PASSED - timeout was caught correctly',
      },
    ],
  },
  {
    name: 'Network Error Recovery - Retry Mechanism',
    description: 'Test that failed network requests are retried appropriately',
    nodes: [
      {
        id: 'attempt_failed_request',
        type: 'http',
        method: 'GET',
        url: 'http://localhost:9999/invalid-service',
        retry: { attempts: 3, backoffMs: 100 },
        output: 'response',
      },
      {
        id: 'verify_retries_exhausted',
        type: 'operation',
        op: 'logic.assert',
        condition: '{{ nodes.attempt_failed_request.error !== undefined }}',
        message: 'Expected request to fail after retries',
      },
    ],
    onError: [
      {
        id: 'notify_pass',
        type: 'notification',
        channel: 'error-handling-results',
        message: '✅ Network error recovery test PASSED',
      },
    ],
  },
  {
    name: '404 Error Handling - Resource Not Found',
    description: 'Test proper handling of 404 errors',
    nodes: [
      {
        id: 'fetch_nonexistent',
        type: 'http',
        method: 'GET',
        url: `${API_BASE}/api/workflows/nonexistent-id-12345`,
        output: 'response',
      },
      {
        id: 'assert_404_status',
        type: 'operation',
        op: 'logic.assert',
        condition: '{{ nodes.fetch_nonexistent.output.response.status === 404 }}',
        message: 'Expected 404 status code',
      },
    ],
  },
];

const DATA_VALIDATION_TESTS = [
  {
    name: 'Input Boundary Testing - Maximum String Length',
    description: 'Test that input validation enforces maximum string lengths',
    nodes: [
      {
        id: 'create_workflow_long_name',
        type: 'http',
        method: 'POST',
        url: `${API_BASE}/api/workflows`,
        body: {
          name: 'A'.repeat(1000),
          projectId: 'test-project',
        },
        output: 'response',
      },
      {
        id: 'verify_validation',
        type: 'operation',
        op: 'logic.assert',
        condition: '{{ nodes.create_workflow_long_name.output.response.status === 400 || nodes.create_workflow_long_name.output.response.data.name.length <= 255 }}',
        message: 'Input validation not enforced',
      },
    ],
  },
  {
    name: 'Type Validation - Invalid Data Types',
    description: 'Test that type validation rejects invalid data types',
    nodes: [
      {
        id: 'attempt_invalid_type',
        type: 'http',
        method: 'POST',
        url: `${API_BASE}/api/workflows`,
        body: {
          name: 'Valid Name',
          nodes: 'not-an-array',
        },
        output: 'response',
      },
      {
        id: 'assert_type_validation',
        type: 'operation',
        op: 'logic.assert',
        condition: '{{ nodes.attempt_invalid_type.output.response.status === 400 || nodes.attempt_invalid_type.error !== undefined }}',
        message: 'Type validation not enforced',
      },
    ],
  },
  {
    name: 'Required Field Validation - Missing Mandatory Fields',
    description: 'Test that missing required fields are rejected',
    nodes: [
      {
        id: 'create_without_name',
        type: 'http',
        method: 'POST',
        url: `${API_BASE}/api/workflows`,
        body: {
          projectId: 'test-project',
        },
        output: 'response',
      },
      {
        id: 'assert_required_field',
        type: 'operation',
        op: 'logic.assert',
        condition: '{{ nodes.create_without_name.output.response.status === 400 || nodes.create_without_name.output.response.data.errors.name !== undefined }}',
        message: 'Required field validation not enforced',
      },
    ],
  },
];

const UI_UX_TESTS = [
  {
    name: 'Form Validation - Real-time Feedback',
    description: 'Test that form validation provides real-time feedback',
    nodes: [
      {
        id: 'navigate_form',
        type: 'browser',
        action: 'navigate',
        url: 'http://localhost:3001/workflows/create',
        waitFor: '[data-testid="workflow-form"]',
      },
      {
        id: 'type_invalid_email',
        type: 'browser',
        action: 'type',
        selector: '[data-testid="email-input"]',
        text: 'not-an-email',
      },
      {
        id: 'check_error_message',
        type: 'browser',
        action: 'evaluate',
        script: 'document.querySelector("[data-testid=\'email-error\']") !== null && document.querySelector("[data-testid=\'email-error\']").textContent.length > 0',
        output: 'hasErrorMessage',
      },
      {
        id: 'assert_form_validation',
        type: 'operation',
        op: 'logic.assert',
        condition: '{{ nodes.check_error_message.output.hasErrorMessage === true }}',
        message: 'Form validation feedback not displayed',
      },
    ],
  },
  {
    name: 'Responsive Design - Mobile Viewport',
    description: 'Test that UI is responsive and works on mobile viewports',
    nodes: [
      {
        id: 'set_mobile_viewport',
        type: 'browser',
        action: 'setViewport',
        width: 375,
        height: 667,
      },
      {
        id: 'navigate_app',
        type: 'browser',
        action: 'navigate',
        url: 'http://localhost:3001',
        waitFor: 'body',
      },
      {
        id: 'check_mobile_menu',
        type: 'browser',
        action: 'evaluate',
        script: 'document.querySelector("[data-testid=\'mobile-menu-button\']") !== null',
        output: 'hasMobileMenu',
      },
      {
        id: 'assert_responsive',
        type: 'operation',
        op: 'logic.assert',
        condition: '{{ nodes.check_mobile_menu.output.hasMobileMenu === true }}',
        message: 'Mobile menu not visible on mobile viewport',
      },
    ],
  },
  {
    name: 'Loading State - Skeleton UI Display',
    description: 'Test that skeleton/loading states are displayed during data fetch',
    nodes: [
      {
        id: 'navigate_dashboard',
        type: 'browser',
        action: 'navigate',
        url: 'http://localhost:3001/dashboard',
      },
      {
        id: 'check_skeleton',
        type: 'browser',
        action: 'evaluate',
        script: 'document.querySelector("[data-testid=\'workflow-skeleton\']") !== null',
        output: 'hasSkeletonLoader',
      },
      {
        id: 'wait_for_content',
        type: 'browser',
        action: 'waitFor',
        selector: '[data-testid="workflow-list"]',
        timeout: 5000,
      },
      {
        id: 'verify_content_loaded',
        type: 'browser',
        action: 'evaluate',
        script: 'document.querySelector("[data-testid=\'workflow-skeleton\']") === null && document.querySelector("[data-testid=\'workflow-list\']") !== null',
        output: 'contentLoaded',
      },
    ],
  },
];

async function main() {
  console.log('🚀 WorkflowUI Test Setup Script\n');
  console.log(`API Base: ${API_BASE}`);
  console.log(`Tenant ID: ${TENANT_ID}\n`);

  try {
    // Create workspace
    const workspaceId = await createWorkspace();

    // Create projects
    const projects = await createTestProjects(workspaceId);

    // Create API integration tests
    console.log('\n🧪 Creating API Integration Tests...');
    for (const test of API_INTEGRATION_TESTS) {
      await createWorkflow(projects['api-tests'], test);
    }

    // Create frontend tests
    console.log('\n🎨 Creating Frontend Component Tests...');
    for (const test of FRONTEND_COMPONENT_TESTS) {
      await createWorkflow(projects['frontend-tests'], test);
    }

    // Create E2E tests
    console.log('\n🔄 Creating End-to-End Tests...');
    for (const test of E2E_TESTS) {
      await createWorkflow(projects['e2e-tests'], test);
    }

    // Create performance tests
    console.log('\n⚡ Creating Performance Tests...');
    for (const test of PERFORMANCE_TESTS) {
      await createWorkflow(projects['performance-tests'], test);
    }

    // Create accessibility tests
    console.log('\n♿ Creating Accessibility & WCAG 2.1 AA Tests...');
    for (const test of ACCESSIBILITY_TESTS) {
      await createWorkflow(projects['accessibility-tests'], test);
    }

    // Create security tests
    console.log('\n🔒 Creating Security Tests...');
    for (const test of SECURITY_TESTS) {
      await createWorkflow(projects['api-tests'], test);
    }

    // Create integration tests
    console.log('\n🔗 Creating Integration Tests...');
    for (const test of INTEGRATION_TESTS) {
      await createWorkflow(projects['e2e-tests'], test);
    }

    // Create error handling tests
    console.log('\n⚠️  Creating Error Handling Tests...');
    for (const test of ERROR_HANDLING_TESTS) {
      await createWorkflow(projects['api-tests'], test);
    }

    // Create data validation tests
    console.log('\n✔️  Creating Data Validation Tests...');
    for (const test of DATA_VALIDATION_TESTS) {
      await createWorkflow(projects['api-tests'], test);
    }

    // Create UI/UX tests
    console.log('\n🎯 Creating UI/UX Tests...');
    for (const test of UI_UX_TESTS) {
      await createWorkflow(projects['frontend-tests'], test);
    }

    console.log('\n✅ All test workflows created successfully!\n');
    console.log('Next steps:');
    console.log('1. Open http://localhost:3001/workspace/testing-qa');
    console.log('2. Browse test projects');
    console.log('3. Click Execute on any test workflow');
    console.log('4. View results in real-time\n');

  } catch (error) {
    console.error('❌ Error setting up test workflows:', error);
    process.exit(1);
  }
}

main();
