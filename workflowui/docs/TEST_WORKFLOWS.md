# WorkflowUI Test Infrastructure via Workflow Projects

**Concept**: All testing happens through workflow projects in the application itself. Use WorkflowUI to test WorkflowUI.

---

## 🧪 Test Project Structure

```
Workspace: "Testing & QA"
├── Project: "API Integration Tests"
│   ├── Workflow: "POST /api/workspaces - Create Workspace"
│   ├── Workflow: "GET /api/workspaces - List Workspaces"
│   ├── Workflow: "PUT /api/workspaces/{id} - Update Workspace"
│   ├── Workflow: "DELETE /api/workspaces/{id} - Delete Workspace"
│   └── ... (all 28 API endpoints)
│
├── Project: "Frontend Component Tests"
│   ├── Workflow: "Render InfiniteCanvas with 100 items"
│   ├── Workflow: "Drag workflow card on canvas"
│   ├── Workflow: "Zoom in/out on canvas"
│   ├── Workflow: "Pan canvas with mouse"
│   ├── Workflow: "Create new workspace via UI"
│   ├── Workflow: "Switch between projects"
│   └── ... (all component interactions)
│
├── Project: "End-to-End Scenarios"
│   ├── Workflow: "Complete User Journey - Create workspace → project → workflow → execute"
│   ├── Workflow: "Collaboration - Multiple users editing same canvas"
│   ├── Workflow: "Performance - Render 500+ workflow cards"
│   ├── Workflow: "Offline & Sync - IndexedDB persistence"
│   └── ... (critical user paths)
│
└── Project: "Playwright E2E Tests"
    ├── Workflow: "E2E: Login → Create Workspace → Add Project → Use Canvas"
    ├── Workflow: "E2E: Keyboard Shortcuts (Ctrl+A, Delete, etc.)"
    ├── Workflow: "E2E: Settings Panel - All sections"
    ├── Workflow: "E2E: Real-time Collaboration - User presence"
    └── ... (complete user flows)
```

---

## 📋 API Integration Test Workflow Examples

### Test: POST /api/workspaces

```json
{
  "version": "2.2.0",
  "name": "POST /api/workspaces - Create Workspace",
  "description": "Test creating a new workspace via API",
  "nodes": [
    {
      "id": "generate_id",
      "type": "operation",
      "op": "string.uuid",
      "output": "workspaceId"
    },
    {
      "id": "prepare_payload",
      "type": "operation",
      "op": "dict.create",
      "data": {
        "id": "{{ nodes.generate_id.output.workspaceId }}",
        "name": "Test Workspace {{ timestamp }}",
        "description": "Automated test workspace",
        "tenantId": "test-tenant",
        "color": "#1976d2"
      },
      "output": "payload"
    },
    {
      "id": "create_workspace",
      "type": "http",
      "method": "POST",
      "url": "http://localhost:5000/api/workspaces",
      "headers": {
        "Content-Type": "application/json"
      },
      "body": "{{ nodes.prepare_payload.output.payload }}",
      "output": "response"
    },
    {
      "id": "assert_status",
      "type": "operation",
      "op": "logic.assert",
      "condition": "{{ nodes.create_workspace.output.response.status === 201 }}",
      "message": "Expected 201 status, got {{ nodes.create_workspace.output.response.status }}"
    },
    {
      "id": "assert_data",
      "type": "operation",
      "op": "logic.assert",
      "condition": "{{ nodes.create_workspace.output.response.data.id === nodes.generate_id.output.workspaceId }}",
      "message": "Workspace ID mismatch"
    },
    {
      "id": "notify_pass",
      "type": "notification",
      "channel": "test-results",
      "message": "✅ POST /api/workspaces PASSED - Created workspace {{ nodes.generate_id.output.workspaceId }}"
    }
  ],
  "onError": [
    {
      "id": "notify_fail",
      "type": "notification",
      "channel": "test-results",
      "message": "❌ POST /api/workspaces FAILED - {{ error.message }}"
    }
  ]
}
```

### Test: GET /api/workspaces

```json
{
  "version": "2.2.0",
  "name": "GET /api/workspaces - List Workspaces",
  "description": "Test fetching workspaces from API",
  "nodes": [
    {
      "id": "fetch_workspaces",
      "type": "http",
      "method": "GET",
      "url": "http://localhost:5000/api/workspaces?tenantId=test-tenant",
      "output": "response"
    },
    {
      "id": "assert_status",
      "type": "operation",
      "op": "logic.assert",
      "condition": "{{ nodes.fetch_workspaces.output.response.status === 200 }}",
      "message": "Expected 200 status"
    },
    {
      "id": "assert_is_array",
      "type": "operation",
      "op": "logic.assert",
      "condition": "{{ Array.isArray(nodes.fetch_workspaces.output.response.data) }}",
      "message": "Response data should be an array"
    },
    {
      "id": "count_workspaces",
      "type": "operation",
      "op": "list.length",
      "list": "{{ nodes.fetch_workspaces.output.response.data }}",
      "output": "count"
    },
    {
      "id": "notify_pass",
      "type": "notification",
      "channel": "test-results",
      "message": "✅ GET /api/workspaces PASSED - Found {{ nodes.count_workspaces.output.count }} workspaces"
    }
  ]
}
```

### Test: PUT /api/workspaces/{id}

```json
{
  "version": "2.2.0",
  "name": "PUT /api/workspaces/{id} - Update Workspace",
  "description": "Test updating a workspace",
  "nodes": [
    {
      "id": "get_workspace_id",
      "type": "variable",
      "ref": "testData.workspaceId",
      "output": "workspaceId"
    },
    {
      "id": "prepare_update",
      "type": "operation",
      "op": "dict.create",
      "data": {
        "name": "Updated Workspace {{ timestamp }}",
        "description": "Updated description",
        "color": "#ff6b6b"
      },
      "output": "payload"
    },
    {
      "id": "update_workspace",
      "type": "http",
      "method": "PUT",
      "url": "http://localhost:5000/api/workspaces/{{ nodes.get_workspace_id.output.workspaceId }}",
      "headers": { "Content-Type": "application/json" },
      "body": "{{ nodes.prepare_update.output.payload }}",
      "output": "response"
    },
    {
      "id": "assert_success",
      "type": "operation",
      "op": "logic.assert",
      "condition": "{{ nodes.update_workspace.output.response.status === 200 && nodes.update_workspace.output.response.data.color === '#ff6b6b' }}",
      "message": "Update failed or color not changed"
    },
    {
      "id": "notify_pass",
      "type": "notification",
      "channel": "test-results",
      "message": "✅ PUT /api/workspaces/{id} PASSED - Updated workspace"
    }
  ]
}
```

---

## 🎨 Frontend Component Test Workflow Examples

### Test: InfiniteCanvas with 100 Items

```json
{
  "version": "2.2.0",
  "name": "Render InfiniteCanvas with 100 items",
  "description": "Performance test: render many workflow cards",
  "nodes": [
    {
      "id": "measure_start",
      "type": "operation",
      "op": "performance.timestamp",
      "output": "startTime"
    },
    {
      "id": "browser_navigate",
      "type": "browser",
      "action": "navigate",
      "url": "http://localhost:3001/project/perf-test-100",
      "waitFor": ".infinite-canvas"
    },
    {
      "id": "count_cards",
      "type": "browser",
      "action": "evaluate",
      "script": "document.querySelectorAll('[data-testid=\"workflow-card\"]').length",
      "output": "cardCount"
    },
    {
      "id": "measure_end",
      "type": "operation",
      "op": "performance.timestamp",
      "output": "endTime"
    },
    {
      "id": "calculate_duration",
      "type": "operation",
      "op": "math.subtract",
      "a": "{{ nodes.measure_end.output.endTime }}",
      "b": "{{ nodes.measure_start.output.startTime }}",
      "output": "duration"
    },
    {
      "id": "assert_count",
      "type": "operation",
      "op": "logic.assert",
      "condition": "{{ nodes.count_cards.output.cardCount === 100 }}",
      "message": "Expected 100 cards, got {{ nodes.count_cards.output.cardCount }}"
    },
    {
      "id": "assert_performance",
      "type": "operation",
      "op": "logic.assert",
      "condition": "{{ nodes.calculate_duration.output.duration < 5000 }}",
      "message": "Rendering took {{ nodes.calculate_duration.output.duration }}ms (threshold: 5000ms)"
    },
    {
      "id": "notify_pass",
      "type": "notification",
      "channel": "test-results",
      "message": "✅ InfiniteCanvas Performance PASSED - Rendered 100 items in {{ nodes.calculate_duration.output.duration }}ms"
    }
  ]
}
```

### Test: Drag Workflow Card

```json
{
  "version": "2.2.0",
  "name": "Drag workflow card on canvas",
  "description": "Test drag-and-drop interaction on canvas",
  "nodes": [
    {
      "id": "navigate_canvas",
      "type": "browser",
      "action": "navigate",
      "url": "http://localhost:3001/project/drag-test",
      "waitFor": ".workflow-card"
    },
    {
      "id": "get_initial_position",
      "type": "browser",
      "action": "evaluate",
      "script": "document.querySelector('[data-testid=\"workflow-card-1\"]').getBoundingClientRect()",
      "output": "initialPos"
    },
    {
      "id": "drag_card",
      "type": "browser",
      "action": "drag",
      "selector": "[data-testid=\"workflow-card-1\"]",
      "startX": "{{ nodes.get_initial_position.output.initialPos.left + 50 }}",
      "startY": "{{ nodes.get_initial_position.output.initialPos.top + 50 }}",
      "endX": 300,
      "endY": 300
    },
    {
      "id": "get_final_position",
      "type": "browser",
      "action": "evaluate",
      "script": "document.querySelector('[data-testid=\"workflow-card-1\"]').getBoundingClientRect()",
      "output": "finalPos"
    },
    {
      "id": "assert_moved",
      "type": "operation",
      "op": "logic.assert",
      "condition": "{{ Math.abs(nodes.get_final_position.output.finalPos.left - nodes.get_initial_position.output.initialPos.left) > 50 }}",
      "message": "Card did not move after drag"
    },
    {
      "id": "notify_pass",
      "type": "notification",
      "channel": "test-results",
      "message": "✅ Drag Workflow Card PASSED - Card moved from ({{ nodes.get_initial_position.output.initialPos.left }}, {{ nodes.get_initial_position.output.initialPos.top }}) to ({{ nodes.get_final_position.output.finalPos.left }}, {{ nodes.get_final_position.output.finalPos.top }})"
    }
  ]
}
```

---

## 🔄 End-to-End Scenario Example

### Complete User Journey Workflow

```json
{
  "version": "2.2.0",
  "name": "Complete User Journey - Create workspace → project → workflow → execute",
  "description": "Full E2E test of creating and executing a workflow",
  "nodes": [
    {
      "id": "step1_create_workspace",
      "type": "http",
      "method": "POST",
      "url": "http://localhost:5000/api/workspaces",
      "body": {
        "id": "e2e-ws-{{ timestamp }}",
        "name": "E2E Test Workspace",
        "tenantId": "e2e-tests",
        "color": "#1976d2"
      },
      "output": "workspace"
    },
    {
      "id": "step2_create_project",
      "type": "http",
      "method": "POST",
      "url": "http://localhost:5000/api/projects",
      "body": {
        "id": "e2e-proj-{{ timestamp }}",
        "name": "E2E Test Project",
        "workspaceId": "{{ nodes.step1_create_workspace.output.workspace.data.id }}",
        "tenantId": "e2e-tests",
        "color": "#ff6b6b"
      },
      "output": "project"
    },
    {
      "id": "step3_navigate_to_project",
      "type": "browser",
      "action": "navigate",
      "url": "http://localhost:3001/project/{{ nodes.step2_create_project.output.project.data.id }}",
      "waitFor": ".infinite-canvas"
    },
    {
      "id": "step4_create_workflow_ui",
      "type": "browser",
      "action": "click",
      "selector": "button:contains('+ Add Workflow')"
    },
    {
      "id": "step5_wait_for_workflow_editor",
      "type": "browser",
      "action": "waitFor",
      "selector": ".workflow-editor",
      "timeout": 5000
    },
    {
      "id": "step6_add_nodes",
      "type": "browser",
      "action": "evaluate",
      "script": "window.__addWorkflowNode({ type: 'start', x: 100, y: 100 })"
    },
    {
      "id": "step7_execute_workflow",
      "type": "browser",
      "action": "click",
      "selector": "button:contains('Execute')"
    },
    {
      "id": "step8_wait_for_execution",
      "type": "browser",
      "action": "waitFor",
      "selector": ".execution-result",
      "timeout": 10000
    },
    {
      "id": "step9_verify_success",
      "type": "browser",
      "action": "evaluate",
      "script": "document.querySelector('.execution-result').textContent.includes('Success')",
      "output": "isSuccess"
    },
    {
      "id": "final_assert",
      "type": "operation",
      "op": "logic.assert",
      "condition": "{{ nodes.step9_verify_success.output.isSuccess === true }}",
      "message": "Execution did not complete successfully"
    },
    {
      "id": "notify_pass",
      "type": "notification",
      "channel": "test-results",
      "message": "✅ Complete User Journey PASSED - Workspace → Project → Workflow → Execution"
    }
  ],
  "onError": [
    {
      "id": "capture_screenshot",
      "type": "browser",
      "action": "screenshot",
      "output": "screenshot"
    },
    {
      "id": "notify_fail",
      "type": "notification",
      "channel": "test-results",
      "message": "❌ Complete User Journey FAILED at step {{ error.step }} - {{ error.message }}\n[Screenshot attached]"
    }
  ]
}
```

---

## 📊 Test Results Dashboard Workflow

```json
{
  "version": "2.2.0",
  "name": "Aggregate Test Results",
  "description": "Collect results from all test workflows and generate report",
  "nodes": [
    {
      "id": "fetch_test_results",
      "type": "database",
      "query": "SELECT * FROM test_executions WHERE timestamp > {{ yesterday }} ORDER BY timestamp DESC",
      "output": "results"
    },
    {
      "id": "count_passed",
      "type": "operation",
      "op": "list.filter",
      "list": "{{ nodes.fetch_test_results.output.results }}",
      "condition": "{{ item.status === 'passed' }}",
      "output": "passedTests"
    },
    {
      "id": "count_failed",
      "type": "operation",
      "op": "list.filter",
      "list": "{{ nodes.fetch_test_results.output.results }}",
      "condition": "{{ item.status === 'failed' }}",
      "output": "failedTests"
    },
    {
      "id": "calculate_success_rate",
      "type": "operation",
      "op": "math.divide",
      "a": "{{ nodes.count_passed.output.passedTests.length }}",
      "b": "{{ nodes.fetch_test_results.output.results.length }}",
      "output": "successRate"
    },
    {
      "id": "generate_report",
      "type": "operation",
      "op": "string.template",
      "template": "## Test Results Report\n\n**Total Tests**: {{ total }}\n**Passed**: {{ passed }} ✅\n**Failed**: {{ failed }} ❌\n**Success Rate**: {{ rate }}%\n\n### Failed Tests:\n{{ failures }}\n",
      "data": {
        "total": "{{ nodes.fetch_test_results.output.results.length }}",
        "passed": "{{ nodes.count_passed.output.passedTests.length }}",
        "failed": "{{ nodes.count_failed.output.failedTests.length }}",
        "rate": "{{ Math.round(nodes.calculate_success_rate.output.successRate * 100) }}",
        "failures": "{{ nodes.count_failed.output.failedTests.map(t => '- ' + t.name).join('\\n') }}"
      },
      "output": "report"
    },
    {
      "id": "notify_results",
      "type": "notification",
      "channel": "test-results",
      "message": "{{ nodes.generate_report.output.report }}"
    },
    {
      "id": "store_report",
      "type": "database",
      "query": "INSERT INTO test_reports (timestamp, total, passed, failed, report) VALUES ({{ now }}, {{ total }}, {{ passed }}, {{ failed }}, {{ report }})",
      "data": {
        "total": "{{ nodes.fetch_test_results.output.results.length }}",
        "passed": "{{ nodes.count_passed.output.passedTests.length }}",
        "failed": "{{ nodes.count_failed.output.failedTests.length }}",
        "report": "{{ nodes.generate_report.output.report }}"
      }
    }
  ]
}
```

---

## 🔧 Test Data Setup Workflow

```json
{
  "version": "2.2.0",
  "name": "Setup Test Data - Create 100 Workflow Cards",
  "description": "Seed database with test data for performance testing",
  "nodes": [
    {
      "id": "create_test_workspace",
      "type": "http",
      "method": "POST",
      "url": "http://localhost:5000/api/workspaces",
      "body": {
        "id": "perf-test-ws",
        "name": "Performance Test Workspace",
        "tenantId": "perf-tests"
      },
      "output": "workspace"
    },
    {
      "id": "create_test_project",
      "type": "http",
      "method": "POST",
      "url": "http://localhost:5000/api/projects",
      "body": {
        "id": "perf-test-100",
        "name": "Performance Test - 100 Items",
        "workspaceId": "{{ nodes.create_test_workspace.output.workspace.data.id }}",
        "tenantId": "perf-tests"
      },
      "output": "project"
    },
    {
      "id": "generate_workflow_cards",
      "type": "operation",
      "op": "list.generate",
      "count": 100,
      "template": {
        "id": "card-{{ index }}",
        "projectId": "{{ nodes.create_test_project.output.project.data.id }}",
        "workflowId": "workflow-{{ index }}",
        "position": {
          "x": "{{ (index % 10) * 350 }}",
          "y": "{{ Math.floor(index / 10) * 250 }}"
        },
        "size": { "width": 300, "height": 200 },
        "zIndex": "{{ index }}"
      },
      "output": "cards"
    },
    {
      "id": "bulk_create_cards",
      "type": "http",
      "method": "POST",
      "url": "http://localhost:5000/api/projects/{{ nodes.create_test_project.output.project.data.id }}/canvas/bulk-update",
      "body": {
        "items": "{{ nodes.generate_workflow_cards.output.cards }}"
      }
    },
    {
      "id": "notify_complete",
      "type": "notification",
      "channel": "test-setup",
      "message": "✅ Test data created - 100 workflow cards in project perf-test-100"
    }
  ]
}
```

---

## 🎯 Running Tests

### Option 1: Run Individual Test Workflow

```bash
# Via UI
1. Navigate to "Testing & QA" workspace
2. Select "API Integration Tests" project
3. Click on "POST /api/workspaces - Create Workspace"
4. Click "Execute"
5. View results in Execution Results panel
```

### Option 2: Run Entire Test Project

```bash
# Batch execute all tests in a project
curl -X POST http://localhost:5000/api/projects/api-tests/execute-all \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "default"}'
```

### Option 3: Run via Command Line (Workflow Engine)

```bash
# Execute workflow file directly
python3 -m workflow.executor \
  --file "api-integration-tests/post-workspaces.json" \
  --env "http://localhost:5000" \
  --report json
```

### Option 4: Scheduled Test Suite

```bash
# Create a master workflow that runs all tests on schedule
{
  "version": "2.2.0",
  "name": "Nightly Test Suite",
  "trigger": "schedule:0 2 * * *",  // 2 AM daily
  "nodes": [
    {
      "id": "run_api_tests",
      "type": "workflow",
      "workflowId": "api-integration-tests",
      "parallel": true
    },
    {
      "id": "run_frontend_tests",
      "type": "workflow",
      "workflowId": "frontend-component-tests",
      "parallel": true
    },
    {
      "id": "run_e2e_tests",
      "type": "workflow",
      "workflowId": "e2e-scenarios",
      "parallel": false
    },
    {
      "id": "aggregate_results",
      "type": "workflow",
      "workflowId": "aggregate-test-results"
    }
  ]
}
```

---

## 📈 Test Coverage Matrix

| Test Area | Coverage | Status |
|-----------|----------|--------|
| **API CRUD** | 28 endpoints | Can create |
| **Frontend Components** | Canvas, Cards, Settings | Can create |
| **User Journeys** | Login → Execute | Can create |
| **Performance** | 100+ items rendering | Can create |
| **Accessibility** | Keyboard shortcuts, screen readers | Can create |
| **Offline/Sync** | IndexedDB, reconnection | Can create |
| **Real-time** | Collaboration, presence | Can create |
| **Error Handling** | API failures, network issues | Can create |

---

## 🚀 Getting Started

### 1. Create Test Workspace

```bash
# Via API
curl -X POST http://localhost:5000/api/workspaces \
  -H "Content-Type: application/json" \
  -d '{
    "id": "testing-qa",
    "name": "Testing & QA",
    "tenantId": "default",
    "color": "#4CAF50"
  }'
```

### 2. Create Test Projects

```bash
# API Integration Tests
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "id": "api-tests",
    "name": "API Integration Tests",
    "workspaceId": "testing-qa",
    "tenantId": "default",
    "color": "#2196F3"
  }'

# Frontend Tests
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "id": "frontend-tests",
    "name": "Frontend Component Tests",
    "workspaceId": "testing-qa",
    "tenantId": "default",
    "color": "#FF9800"
  }'

# E2E Tests
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "id": "e2e-tests",
    "name": "End-to-End Scenarios",
    "workspaceId": "testing-qa",
    "tenantId": "default",
    "color": "#9C27B0"
  }'
```

### 3. Import Test Workflows

Create workflows in each project using the JSON examples above, or:

```bash
# Script to auto-create all test workflows
npm run setup:test-workflows
```

### 4. Run Tests

```bash
# Run via UI - navigate to any test workflow and click Execute
# Or via API:
curl -X POST http://localhost:5000/api/workflows/post-workspaces/execute

# Or scheduled - workflows with trigger: "schedule:*" run automatically
```

---

## 📊 Expected Output

Each test generates structured results:

```json
{
  "workflowId": "post-workspaces",
  "status": "passed",
  "duration": 243,
  "startTime": 1674432000000,
  "endTime": 1674432000243,
  "results": {
    "passed": 3,
    "failed": 0,
    "assertions": [
      {
        "name": "assert_status",
        "condition": "response.status === 201",
        "result": true
      },
      {
        "name": "assert_data",
        "condition": "response.data.id === workspaceId",
        "result": true
      }
    ]
  },
  "output": {
    "workspaceId": "ws-abc123",
    "createdAt": 1674432000000
  }
}
```

---

## 🎯 Benefits of Workflow-Based Testing

✅ **Meta-testing**: Use the system to test itself
✅ **Visibility**: All tests visible in the UI as workflow projects
✅ **Traceability**: Full execution history and logs
✅ **Reusability**: Test workflows can be reused and combined
✅ **Automation**: Scheduled testing via workflow triggers
✅ **Real-time Results**: See failures/passes in real-time
✅ **Documentation**: Test workflows serve as API/feature documentation
✅ **Collaboration**: Team can add/modify tests through UI

---

This approach turns testing into a first-class feature of WorkflowUI itself! 🚀

