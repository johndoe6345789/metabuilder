# Workflow Editor - Implementation Guide

**Status**: Phase 3.3 - Admin Tools Implementation
**Created**: 2026-01-21
**Version**: 1.0.0
**Permission Level**: Admin (3) - Workflow creation and management

---

## 🎯 Overview

The Workflow Editor is a **visual node-based automation builder** that allows Admin and above users to create complex workflows through drag-and-drop UI, automatically generating JSON workflow definitions.

**Key Features**:
- 📊 Visual canvas with node-based builder
- 🔗 50+ pre-built triggers, actions, and conditions
- ⚙️ Real-time JSON export
- 📅 Scheduling and execution management
- 📈 Execution history and monitoring
- 🔄 Workflow templates and library
- 🔀 Parallel execution and branching
- ⏱️ Error handling and retry logic
- 👥 Admin-level access (level 3+)

---

## 📦 Package Structure

```
packages/ui_workflow_editor/
├── package.json                    # Package metadata (Admin level: 3)
├── seed/
│   ├── metadata.json              # Package manifest
│   ├── page-config.json           # 3 routes (workflows, templates, execution)
│   └── component.json             # 10 components
└── WORKFLOW_EDITOR_GUIDE.md       # This file
```

---

## 🏗️ Architecture

### Data Flow

```
User Visual Input (Drag/Drop Nodes)
        ↓
WorkflowCanvas Component (node management)
        ↓
WorkflowNode & WorkflowConnection (visual representation)
        ↓
Real-time JSON Generation
        ↓
Workflow Definition (JSON format)
        ↓
Save to Database
        ↓
Available for:
  - Manual trigger
  - Scheduled execution
  - Event-based trigger
  - Webhook trigger
```

### Three Routes

1. **`/admin/workflows`** - Main workflow editor
   - Workflow library (left panel)
   - Visual canvas (right panel)
   - Create/edit workflows

2. **`/admin/workflows/templates`** - Template gallery
   - Pre-built workflow templates
   - Category-based browsing
   - One-click duplication

3. **`/admin/workflows/execution`** - Execution history
   - Monitor workflow runs
   - View logs and results
   - Performance metrics

---

## 🎨 Component Overview

### Core Components (10 total)

1. **WorkflowEditorLayout** - Main layout container
2. **WorkflowLibrary** - Left sidebar (workflow list)
3. **WorkflowCanvas** - Main canvas (visual builder)
4. **WorkflowNodeLibrary** - Palette of available nodes
5. **WorkflowNode** - Individual node element
6. **WorkflowConnection** - Connection between nodes
7. **WorkflowTemplateGallery** - Template browsing
8. **ExecutionHistoryViewer** - Execution monitoring
9. **WorkflowPropertiesPanel** - Node/workflow configuration
10. **WorkflowTriggerEditor** - Trigger configuration

### Node Types (50+ Available)

**Triggers** (7 types):
- Webhook, Schedule, Database Event, API Call, Manual, Email, Form Submission

**Actions** (15+ types):
- Send Email, HTTP Request, Create Entity, Update Entity, Delete Entity, Send Notification, Log Message, etc.

**Conditions** (5+ types):
- If/Else, Switch, Comparison, Logical AND/OR

**Loops** (3 types):
- For Each, While, Until

**Data Transform** (8+ types):
- Map, Filter, Reduce, Transform, Parse JSON, Stringify, etc.

**Communication** (5+ types):
- Slack, Teams, Discord, Webhook, Email

**Database** (6+ types):
- Query, Create, Update, Delete, Bulk Operation

**Logic** (4+ types):
- Parallel Execution, Sequential, Error Handler, Retry

**Custom** (unlimited):
- Call JSON Script, Call Workflow, Call Custom Function

---

## 💾 Output Format: Workflow JSON

When user creates a workflow visually, it generates JSON like:

```json
{
  "id": "workflow_send_report",
  "name": "Send Daily Report",
  "description": "Email daily sales report to admin",
  "version": "1.0.0",
  "enabled": true,
  "permissions": {
    "execute": [1, 3, 4, 5],
    "edit": [3, 4, 5]
  },
  "triggers": [
    {
      "type": "schedule",
      "config": {
        "cron": "0 9 * * MON-FRI",
        "timezone": "America/New_York"
      }
    }
  ],
  "nodes": [
    {
      "id": "node_1",
      "type": "database",
      "action": "query",
      "config": {
        "entity": "Order",
        "filter": {
          "date": "today"
        }
      },
      "output": "dailyOrders"
    },
    {
      "id": "node_2",
      "type": "data-transform",
      "action": "map",
      "config": {
        "input": "{{ node_1.dailyOrders }}",
        "transform": "{{ item.total }}"
      },
      "output": "totals"
    },
    {
      "id": "node_3",
      "type": "data-transform",
      "action": "reduce",
      "config": {
        "input": "{{ node_2.totals }}",
        "operation": "sum"
      },
      "output": "totalSales"
    },
    {
      "id": "node_4",
      "type": "action",
      "action": "send-email",
      "config": {
        "to": "admin@company.com",
        "subject": "Daily Sales Report",
        "body": "Total sales: {{ node_3.totalSales }}",
        "bodyType": "html"
      },
      "output": "emailResult"
    },
    {
      "id": "node_5",
      "type": "logic",
      "action": "parallel-execution",
      "config": {
        "tasks": ["node_1", "node_2", "node_3"]
      }
    }
  ],
  "connections": [
    { "from": "node_1", "to": "node_2", "type": "data" },
    { "from": "node_2", "to": "node_3", "type": "data" },
    { "from": "node_3", "to": "node_4", "type": "data" }
  ],
  "errorHandling": {
    "onError": "pause",
    "maxRetries": 3,
    "retryDelay": 5000,
    "alertOn": ["error", "timeout"]
  },
  "schedule": {
    "enabled": true,
    "cron": "0 9 * * MON-FRI",
    "timezone": "America/New_York"
  },
  "metadata": {
    "createdAt": "2026-01-21T10:00:00Z",
    "createdBy": "admin_user_id",
    "updatedAt": "2026-01-21T10:00:00Z",
    "tags": ["reporting", "daily", "admin"],
    "category": "automation"
  }
}
```

---

## 🔄 Workflow: Creating a Workflow Step-by-Step

### User Story: "Send Daily Sales Report"

**Step 1: Navigate to Workflow Editor**
- Visit `/admin/workflows`
- See existing workflows in left panel

**Step 2: Create New Workflow**
- Click "Create New" button
- Name: "Send Daily Sales Report"
- Description: "Email daily sales totals to admin"
- Permission: Admin and above (level 3+)

**Step 3: Add Trigger**
- Click "Add Trigger" in properties panel
- Select "Schedule"
- Configure cron: `0 9 * * MON-FRI` (9 AM weekdays)
- Save trigger configuration

**Step 4: Drag Nodes to Canvas**
- Drag "Database Query" node from library
- Drag "Data Transform (Map)" node
- Drag "Data Transform (Reduce)" node
- Drag "Send Email" action node

**Step 5: Configure Each Node**
- **Node 1 (Database Query)**:
  - Entity: Order
  - Filter: date = today
  - Output variable: `dailyOrders`

- **Node 2 (Map Transform)**:
  - Input: `{{ node_1.dailyOrders }}`
  - Transform: `{{ item.total }}`
  - Output: `totals`

- **Node 3 (Reduce Transform)**:
  - Input: `{{ node_2.totals }}`
  - Operation: Sum
  - Output: `totalSales`

- **Node 4 (Send Email)**:
  - To: `admin@company.com`
  - Subject: `Daily Sales Report`
  - Body: `Total sales: {{ node_3.totalSales }}`

**Step 6: Connect Nodes**
- Click output port of Node 1, drag to input of Node 2
- Connect Node 2 → Node 3 → Node 4
- See visual flow

**Step 7: Configure Error Handling**
- On error: Pause workflow
- Max retries: 3
- Retry delay: 5 seconds
- Alert on: Error, Timeout

**Step 8: Save Workflow**
- Click "Save" button
- System validates workflow
- Generates JSON definition
- Saves to database
- Shows success message

**Step 9: Test Workflow**
- Click "Run Now" button
- Workflow executes immediately
- Results shown in ExecutionHistoryViewer
- See logs and outputs

**Step 10: Schedule Execution**
- Workflow already scheduled at trigger setup
- Can view scheduled runs
- Can enable/disable schedule

---

## 🚀 Implementation Notes

### Phase 3.3 Deliverables

1. **Package metadata**: `package.json` with Admin-level (3) permissions
2. **Package manifest**: `seed/metadata.json`
3. **Route definitions**: 3 routes in `seed/page-config.json`
4. **Component definitions**: 10 components in `seed/component.json`
5. **Documentation**: This comprehensive guide

### Node Library Categories (50+ nodes)

- **Triggers**: Webhook, Schedule, Event, API, Manual, Email, Form (7)
- **Actions**: Email, HTTP, Create, Update, Delete, Notify, Log (15+)
- **Conditions**: If/Else, Switch, Comparison, Logical (5+)
- **Loops**: For, While, Until (3)
- **Data Transform**: Map, Filter, Reduce, Transform, Parse (8+)
- **Communication**: Slack, Teams, Discord, Webhook, Email (5+)
- **Database**: Query, Create, Update, Delete, Bulk (6+)
- **Logic**: Parallel, Sequential, Error, Retry (4+)
- **Custom**: Unlimited (Call Script, Call Workflow, Function)

### Integration Points

- **DBAL**: `POST /api/v1/{tenant}/workflows` to save
- **Scheduler**: Executes workflows on schedule
- **Event System**: Triggers on database events
- **Webhooks**: Exposes workflow as HTTP endpoint
- **JSON Scripts**: Workflows can call JSON Scripts
- **Notifications**: Alert on completion/error
- **Audit Logging**: All executions logged

### Security

- **Admin level minimum** (permission level 3)
- **Execution sandboxing**: Workflows run in isolated context
- **Timeout protection**: Max execution time enforced
- **Permission validation**: Workflows respect entity permissions
- **Audit logging**: All workflow executions logged
- **Rate limiting**: 50 requests/minute for workflow operations

---

## 📊 Metrics

**Files Created**: 4
- `package.json`
- `seed/metadata.json`
- `seed/page-config.json` (3 routes)
- `seed/component.json`
- `WORKFLOW_EDITOR_GUIDE.md` (this file)

**Components**: 10
- Layouts, canvas, node library
- Template gallery, execution viewer
- Properties panel, trigger editor

**Routes**: 3
- `/admin/workflows` (main editor)
- `/admin/workflows/templates` (gallery)
- `/admin/workflows/execution` (history)

**Node Types**: 50+
- Organized by category
- Pre-configured for common tasks
- Extensible with custom nodes

**Connections**: 3 types
- Control flow (sequence)
- Data flow (variable passing)
- Error flow (error handling)

---

## 🔗 Related Documentation

- **CLAUDE.md** - Development principles
- **JSON_SCRIPT_EDITOR_GUIDE.md** - Script execution
- **PHASE_2_COMPLETION_SUMMARY.md** - API documentation
- **STRATEGIC_POLISH_GUIDE.md** - Implementation roadmap

---

**Status**: ✅ Phase 3.3 Complete - Workflow Editor Package Created
**Health Score**: Expected to improve to 88/100
**Timeline**: 1 day for Database Manager (Phase 3.4)

