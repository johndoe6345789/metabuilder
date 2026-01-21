# Workflow Engine Integration Guide

## Architecture

```
┌─────────────────────────────────────────┐
│  Next.js Frontend (frontends/nextjs)     │
│  - Workflow Builder UI                  │
│  - Execution Monitor                    │
│  - Trigger Management                   │
└────────────┬────────────────────────────┘
             │ HTTP/WebSocket
             ↓
┌─────────────────────────────────────────┐
│  MetaBuilder API (frontends/nextjs/app/api)
│  - Workflow API Routes                  │
│  - Execution Endpoints                  │
│  - Registry Lookup                      │
└────────────┬────────────────────────────┘
             │ Import
             ↓
┌─────────────────────────────────────────┐
│  Workflow Engine (workflow/)             │
│  - DAGExecutor                          │
│  - Type Definitions                     │
│  - Plugin Registry                      │
│  - Built-in Executors                  │
└────────────┬────────────────────────────┘
             │ Use
             ↓
┌─────────────────────────────────────────┐
│  Database (SQLite/PostgreSQL)            │
│  - Workflow Definitions                 │
│  - Execution History                    │
│  - Credentials                          │
└─────────────────────────────────────────┘
```

## Integration Steps

### 1. Install Workflow Package

In `frontends/nextjs/package.json`:

```json
{
  "dependencies": {
    "@metabuilder/workflow": "file:../../workflow",
    "@metabuilder/workflow-plugin-dbal-read": "file:../../workflow/plugins/dbal/dbal-read",
    "@metabuilder/workflow-plugin-dbal-write": "file:../../workflow/plugins/dbal/dbal-write",
    "@metabuilder/workflow-plugin-http-request": "file:../../workflow/plugins/integration/http-request",
    "@metabuilder/workflow-plugin-email-send": "file:../../workflow/plugins/integration/email-send",
    "@metabuilder/workflow-plugin-condition": "file:../../workflow/plugins/control-flow/condition",
    "@metabuilder/workflow-plugin-wait": "file:../../workflow/plugins/utility/wait"
  }
}
```

### 2. Create Workflow Service

`frontends/nextjs/src/lib/workflow/workflow-service.ts`:

```typescript
import { DAGExecutor, WorkflowDefinition, WorkflowContext } from '@metabuilder/workflow';
import { getNodeExecutorRegistry, registerBuiltInExecutors } from '@metabuilder/workflow';
import { getDBALClient } from '../db-client';

// Initialize on startup
registerBuiltInExecutors();

export async function executeWorkflow(
  workflowId: string,
  context: WorkflowContext
): Promise<any> {
  // Load workflow definition from database
  const db = getDBALClient();
  const workflow = await db.workflows.get(workflowId);

  if (!workflow) {
    throw new Error(`Workflow not found: ${workflowId}`);
  }

  // Create executor
  const executor = new DAGExecutor(
    `exec-${Date.now()}`,
    workflow,
    context,
    async (nodeId, workflow, context, state) => {
      // Use registry to execute node
      const registry = getNodeExecutorRegistry();
      const node = workflow.nodes.find(n => n.id === nodeId);

      if (!node) {
        throw new Error(`Node not found: ${nodeId}`);
      }

      return await registry.execute(node.nodeType, node, context, state);
    }
  );

  // Execute
  const state = await executor.execute();
  const metrics = executor.getMetrics();

  // Save execution record
  await db.executionRecords.create({
    workflowId,
    tenantId: context.tenantId,
    userId: context.userId,
    status: 'success',
    state,
    metrics,
    startTime: new Date(metrics.startTime),
    endTime: new Date(metrics.endTime || Date.now()),
    duration: metrics.duration
  });

  return state;
}
```

### 3. Create API Routes

`frontends/nextjs/app/api/v1/[tenant]/workflows/[workflowId]/execute/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { executeWorkflow } from '@/lib/workflow/workflow-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { tenant: string; workflowId: string } }
) {
  const { tenant, workflowId } = params;
  const body = await request.json();

  // Build context
  const context = {
    executionId: `exec-${Date.now()}`,
    tenantId: tenant,
    userId: body.userId,
    user: body.user,
    trigger: body.trigger,
    triggerData: body.triggerData,
    variables: body.variables || {},
    secrets: process.env // Filter in production!
  };

  try {
    const state = await executeWorkflow(workflowId, context);
    return NextResponse.json({ success: true, state });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
```

### 4. Frontend - Workflow Builder Component

`frontends/nextjs/src/components/workflow/WorkflowBuilder.tsx`:

```typescript
import { WorkflowDefinition, WorkflowNode } from '@metabuilder/workflow';
import { useState } from 'react';

export function WorkflowBuilder({ workflowId }: { workflowId: string }) {
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null);
  const [executing, setExecuting] = useState(false);

  const handleExecute = async () => {
    setExecuting(true);
    try {
      const response = await fetch(`/api/v1/acme/workflows/${workflowId}/execute`, {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-123',
          user: { id: 'user-123', email: 'user@example.com', level: 3 },
          triggerData: { /* input data */ }
        })
      });

      const result = await response.json();
      console.log('Execution result:', result);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="workflow-builder">
      <button onClick={handleExecute} disabled={executing}>
        {executing ? 'Executing...' : 'Execute'}
      </button>
      {/* Workflow canvas/nodes UI */}
    </div>
  );
}
```

### 5. Database Schema

Add to YAML schema:

```yaml
# dbal/shared/api/schema/entities/core/workflow.yaml
Workflow:
  type: object
  properties:
    id: { type: string, primary: true }
    tenantId: { type: string, index: true }
    name: { type: string }
    definition: { type: json }
    active: { type: boolean }
    createdBy: { type: string }
    createdAt: { type: datetime }
    updatedAt: { type: datetime }

ExecutionRecord:
  type: object
  properties:
    id: { type: string, primary: true }
    workflowId: { type: string, index: true }
    tenantId: { type: string, index: true }
    userId: { type: string }
    status: { type: enum, values: ['running', 'success', 'error', 'aborted'] }
    state: { type: json }
    metrics: { type: json }
    startTime: { type: datetime }
    endTime: { type: datetime }
    createdAt: { type: datetime }
```

## Execution Flow

1. **Frontend** → POST `/api/v1/{tenant}/workflows/{id}/execute`
2. **API Route** → Load workflow from DB → Build context
3. **WorkflowService** → Create DAGExecutor → Register plugins
4. **DAGExecutor** → Execute DAG with plugin system
5. **Plugins** → Call database, HTTP, etc.
6. **Save Results** → Store execution record in DB
7. **Response** → Return execution state to frontend

## Multi-Tenancy

All workflows enforce tenant isolation:

```typescript
// Automatically filtered
const workflows = await db.workflows.list({
  filter: { tenantId: context.tenantId }
});

// In workflow execution
const nodes = workflow.nodes.filter(n => n.parameters.tenantId === context.tenantId);
```

## Error Handling

Workflows support multiple error strategies:

- `stopWorkflow` - Stop on error (default)
- `continueRegularOutput` - Continue with empty output
- `continueErrorOutput` - Route to error port
- `retry` - Automatic retry with backoff

## Performance Optimization

1. **Caching**: Cache workflow definitions in memory
2. **Async Execution**: Use job queue for long-running workflows
3. **Rate Limiting**: Apply limits per tenant/user
4. **Metrics**: Track execution performance

## Next Steps

1. Create workflow schema in YAML
2. Implement workflow CRUD API endpoints
3. Build visual workflow builder UI
4. Add execution monitoring dashboard
5. Create workflow templates library
