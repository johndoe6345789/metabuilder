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

import fetch from 'node-fetch';

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
