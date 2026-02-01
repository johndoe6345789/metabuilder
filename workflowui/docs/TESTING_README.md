# WorkflowUI Testing Infrastructure

**Concept**: All tests live as workflow projects in the application itself. Use WorkflowUI to test WorkflowUI.

---

## 🎯 Quick Start: Run Tests in 3 Steps

### Step 1: Start the Backend & Frontend
```bash
# Terminal 1: Backend
cd workflowui/backend
python3 server_sqlalchemy.py

# Terminal 2: Frontend
cd workflowui
npm run dev
```

### Step 2: Setup Test Workflows
```bash
npm run setup:test-workflows
```

This creates:
- `Testing & QA` workspace
- 4 test projects with 7+ workflows
- All ready to execute

### Step 3: Run Tests
Open http://localhost:3001/workspace/testing-qa and click **Execute** on any workflow.

---

## 📁 Test Organization

```
Workspace: Testing & QA (Green #4CAF50)
│
├── Project: API Integration Tests (Blue #2196F3)
│   ├── POST /api/workspaces - Create Workspace
│   ├── GET /api/workspaces - List Workspaces
│   ├── GET /api/health - Health Check
│   ├── POST /api/projects - Create Project
│   ├── PUT /api/projects/{id} - Update Project
│   ├── DELETE /api/projects/{id} - Delete Project
│   ├── POST /api/canvas/items - Add to Canvas
│   ├── PUT /api/canvas/items/{id} - Update Position
│   ├── DELETE /api/canvas/items/{id} - Remove from Canvas
│   └── ... (28 total endpoints)
│
├── Project: Frontend Component Tests (Orange #FF9800)
│   ├── Navigate to Dashboard
│   ├── Navigate to Login
│   ├── Navigate to Register
│   ├── Render InfiniteCanvas
│   ├── Drag Workflow Card
│   ├── Zoom Canvas
│   ├── Pan Canvas
│   └── ... (all UI interactions)
│
├── Project: End-to-End Scenarios (Purple #9C27B0)
│   ├── Test Data Setup - Create Workspace & Project
│   ├── Complete User Journey - Create → Execute → View Results
│   ├── Collaboration - Multiple Users Editing
│   ├── Keyboard Shortcuts - Ctrl+A, Delete, etc.
│   └── ... (complete workflows)
│
└── Project: Performance & Load Tests (Pink #E91E63)
    ├── Setup Performance Test Data - 100 Items
    ├── Setup Performance Test Data - 500 Items
    ├── Render 100 Workflow Cards
    ├── Drag 100 Items Simultaneously
    └── Measure Memory Usage
```

---

## 🧪 How Tests Work

### Anatomy of a Test Workflow

Every test is a JSON workflow with this structure:

```json
{
  "version": "2.2.0",
  "name": "Test Name",
  "description": "What this tests",
  "nodes": [
    { "id": "step1", "type": "http", "method": "GET", ... },
    { "id": "step2", "type": "operation", "op": "logic.assert", ... },
    { "id": "step3", "type": "notification", ... }
  ],
  "onError": [
    { "id": "handle_error", "type": "notification", ... }
  ]
}
```

### Execution Flow

```
1. User clicks Execute on workflow
   ↓
2. Backend enqueues execution
   ↓
3. Workflow executor processes nodes sequentially (or parallel)
   ↓
4. Each node:
   - Runs (HTTP call, assertion, browser action, etc.)
   - Passes data to next node via {{ nodes.X.output.Y }}
   - On failure, jumps to onError handlers
   ↓
5. Results stored in database
   ↓
6. UI updates in real-time with progress/results
```

### Test Result Structure

```json
{
  "workflowId": "post-workspaces",
  "status": "passed",
  "duration": 243,
  "executedAt": 1674432000000,
  "results": {
    "assertions": [
      {
        "id": "assert_status",
        "condition": "response.status === 201",
        "passed": true
      },
      {
        "id": "assert_data",
        "condition": "response.data.id === workspaceId",
        "passed": true
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

## 🔧 Creating New Tests

### Template: API Endpoint Test

```json
{
  "version": "2.2.0",
  "name": "POST /api/YOUR_ENDPOINT - Description",
  "description": "What you're testing",
  "nodes": [
    {
      "id": "prepare_data",
      "type": "operation",
      "op": "dict.create",
      "data": {
        "id": "test-{{ timestamp }}",
        "name": "Test Item"
      },
      "output": "payload"
    },
    {
      "id": "make_request",
      "type": "http",
      "method": "POST",
      "url": "http://localhost:5000/api/YOUR_ENDPOINT",
      "headers": { "Content-Type": "application/json" },
      "body": "{{ nodes.prepare_data.output.payload }}",
      "output": "response"
    },
    {
      "id": "assert_status",
      "type": "operation",
      "op": "logic.assert",
      "condition": "{{ nodes.make_request.output.response.status === 201 }}",
      "message": "Expected 201, got {{ nodes.make_request.output.response.status }}"
    },
    {
      "id": "assert_data",
      "type": "operation",
      "op": "logic.assert",
      "condition": "{{ nodes.make_request.output.response.data.id === 'test-' + timestamp }}",
      "message": "Response data mismatch"
    },
    {
      "id": "notify_success",
      "type": "notification",
      "channel": "test-results",
      "message": "✅ Test passed"
    }
  ],
  "onError": [
    {
      "id": "notify_failure",
      "type": "notification",
      "channel": "test-results",
      "message": "❌ Test failed: {{ error.message }}"
    }
  ]
}
```

### Template: Browser/UI Test

```json
{
  "version": "2.2.0",
  "name": "UI Test - Description",
  "description": "What you're testing",
  "nodes": [
    {
      "id": "navigate",
      "type": "browser",
      "action": "navigate",
      "url": "http://localhost:3001/YOUR_PAGE",
      "waitFor": ".selector-to-wait-for",
      "timeout": 5000
    },
    {
      "id": "perform_action",
      "type": "browser",
      "action": "click",
      "selector": "button.my-button"
    },
    {
      "id": "verify_result",
      "type": "browser",
      "action": "evaluate",
      "script": "document.querySelector('.result').textContent === 'Expected'",
      "output": "isCorrect"
    },
    {
      "id": "assert_result",
      "type": "operation",
      "op": "logic.assert",
      "condition": "{{ nodes.verify_result.output.isCorrect === true }}",
      "message": "Test assertion failed"
    }
  ]
}
```

### Adding a Test to the UI

1. Navigate to http://localhost:3001/workspace/testing-qa
2. Click on a test project (e.g., "API Integration Tests")
3. Click **+ New Workflow** (or create via API)
4. Paste JSON workflow above
5. Click **Save**
6. Click **Execute** to run

---

## 📊 Running Tests at Scale

### Option 1: Run Single Test
```bash
# Via UI
Click Execute button on workflow

# Via API
curl -X POST http://localhost:5000/api/workflows/{workflowId}/execute
```

### Option 2: Run All Tests in a Project
```bash
# Via API
curl -X POST http://localhost:5000/api/projects/{projectId}/execute-all
```

### Option 3: Run All Tests in Workspace
```bash
# Via API
curl -X POST http://localhost:5000/api/workspaces/{workspaceId}/execute-all
```

### Option 4: Scheduled Tests

Create a "master" test workflow with scheduling:

```json
{
  "version": "2.2.0",
  "name": "Scheduled Nightly Tests",
  "trigger": "schedule:0 2 * * *",
  "description": "Runs every day at 2 AM",
  "nodes": [
    {
      "id": "run_all_api_tests",
      "type": "workflow",
      "workflowId": "master-api-tests",
      "parallel": true
    },
    {
      "id": "run_all_frontend_tests",
      "type": "workflow",
      "workflowId": "master-frontend-tests",
      "parallel": true
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

## 📈 Test Coverage Roadmap

| Category | Status | Examples |
|----------|--------|----------|
| **API Endpoints** | Ready | POST, GET, PUT, DELETE for all 28 endpoints |
| **Component Rendering** | Ready | Canvas, Cards, Settings panels |
| **User Interactions** | Ready | Clicks, drags, keyboard shortcuts |
| **Complete Flows** | Ready | Login → Create → Execute → Results |
| **Performance** | Ready | Render 100+ items, measure duration |
| **Offline/Sync** | Ready | IndexedDB persistence, reconnection |
| **Real-time** | Ready | Collaboration, presence indicators |
| **Error Handling** | Ready | API failures, network issues |
| **Accessibility** | Ready | Keyboard navigation, screen readers |

---

## 🎯 Benefits of Workflow-Based Testing

✅ **Meta-System**: Use the system to test itself - pure elegance
✅ **Full Visibility**: All tests visible in UI as workflow projects
✅ **Complete Traceability**: Full execution history with logs
✅ **Reusability**: Test workflows can be combined and reused
✅ **Automation**: Scheduled testing via workflow triggers
✅ **Real-time**: See failures/passes in real-time as workflows execute
✅ **Documentation**: Test workflows ARE API documentation
✅ **Team Collaboration**: Non-developers can add/modify tests via UI
✅ **Data Driven**: Tests can use fixtures, test data, parametrization
✅ **Integrated Results**: Test results stored in same database as workflows

---

## 🚀 Getting Started Now

### 1. Setup (1 command)
```bash
npm run setup:test-workflows
```

### 2. View Tests
Open http://localhost:3001/workspace/testing-qa

### 3. Execute Tests
Click **Execute** on any workflow

### 4. Check Results
View in real-time in the execution results panel

### 5. Add Your Own
Copy a template, modify, and execute

---

## 📚 Documentation

See **[TEST_WORKFLOWS.md](./TEST_WORKFLOWS.md)** for:
- Complete test examples (API, Frontend, E2E)
- Test structure and patterns
- How to write your own tests
- Results aggregation and reporting

---

## 🔍 Key Files

| File | Purpose |
|------|---------|
| `TEST_WORKFLOWS.md` | Complete test examples and patterns |
| `scripts/setup-test-workflows.ts` | Script to create all test workflows |
| `backend/models.py` | Database schema for test results |
| `backend/server_sqlalchemy.py` | API endpoints for test execution |
| `src/store/slices/workflowSlice.ts` | Redux state for test execution |

---

## 🧠 Philosophy

> **Why use workflows for testing?**
>
> Workflows are the fundamental abstraction of this system. Why introduce a separate testing framework when the system can test itself?
>
> Benefits:
> - One paradigm to learn (workflows)
> - Tests are first-class citizens in the app
> - Team can see and modify tests without leaving UI
> - Complete traceability of all tests and results
> - Natural integration with execution engine
> - Reusable test components (workflows calling workflows)
>
> This is meta-testing done right. ✨

---

## 💡 Pro Tips

- **Share test results**: Use notification nodes to send results to Slack/email
- **Data fixtures**: Create setup workflows that generate test data
- **Parameterization**: Use variables and loops to test multiple scenarios
- **Performance profiling**: Use performance.timestamp nodes to measure duration
- **Screenshots**: Use browser.screenshot nodes to capture UI state on failure
- **Combine tests**: Have one master workflow call all test workflows
- **Version tests**: Each workflow has version field, track test versions over time

---

## 🎓 Learning Path

1. **Start**: Read this file
2. **Examples**: Review [TEST_WORKFLOWS.md](./TEST_WORKFLOWS.md)
3. **Setup**: Run `npm run setup:test-workflows`
4. **Execute**: Click Execute on simple tests first
5. **Learn**: Study how test workflows are structured
6. **Create**: Copy a test template and modify
7. **Share**: Add your own tests to the workspace

---

## ❓ FAQ

**Q: Where do test results go?**
A: Database table `executions` with full logs and output.

**Q: Can I run tests from CLI?**
A: Yes, via workflow executor: `python3 -m workflow.executor --file test.json`

**Q: Can tests call other tests?**
A: Yes! Use `"type": "workflow"` nodes to call other workflows.

**Q: How do I debug failing tests?**
A: Click on execution in UI to see full logs and error messages.

**Q: Can I schedule tests?**
A: Yes! Use `"trigger": "schedule:CRON_EXPRESSION"` in workflow.

**Q: How many tests can I run?**
A: Unlimited. Tests can run sequentially or in parallel.

**Q: Can I test 3rd party APIs?**
A: Yes! HTTP nodes can call any API, perfect for integration testing.

---

**Ready to test workflows with workflows!** 🚀

Execute the setup script and watch your test suite come to life in the UI.

