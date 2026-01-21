# Workflow Engine - Quick Start Guide

## Setup (5 minutes)

### 1. Initialize Engine (Server)
```typescript
// app/layout.tsx
import { initializeWorkflowEngine } from '@/lib/workflow'

export default function RootLayout() {
  // Initialize on startup
  if (typeof window === 'undefined') {
    initializeWorkflowEngine()
  }
  return <html>...</html>
}
```

### 2. Use in Component (Client)
```typescript
'use client'
import { useWorkflow } from '@/hooks/useWorkflow'
import { WorkflowBuilder } from '@/components/workflow/WorkflowBuilder'

export default function WorkflowPage({ params }) {
  const { execute, loading } = useWorkflow()
  
  return (
    <WorkflowBuilder
      workflow={workflow}
      tenant={params.tenant}
      onExecute={(result) => console.log(result)}
    />
  )
}
```

## API Usage (3 methods)

### Method 1: React Hook (Recommended)
```typescript
const { execute, state, error, loading } = useWorkflow()

await execute({
  tenant: 'acme',
  workflowId: 'wf-123',
  triggerData: { key: 'value' }
})
```

### Method 2: Direct Fetch
```typescript
const response = await fetch('/api/v1/acme/workflows/wf-123/execute', {
  method: 'POST',
  body: JSON.stringify({ triggerData: {} })
})
const execution = await response.json()
```

### Method 3: Monitoring
```typescript
import { ExecutionMonitor } from '@/components/workflow/ExecutionMonitor'

<ExecutionMonitor
  tenant="acme"
  workflowId="wf-123"
/>
```

## Common Patterns

### Pattern 1: Create Workflow
```typescript
const workflow = await fetch('/api/v1/acme/workflows', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Process Orders',
    category: 'automation',
    nodes: [],
    connections: {}
  })
})
```

### Pattern 2: List Workflows
```typescript
const response = await fetch('/api/v1/acme/workflows?category=automation&limit=10')
const { workflows } = await response.json()
```

### Pattern 3: Monitor History
```typescript
const { executions, refresh } = useWorkflowExecutions(
  'acme',
  'wf-123',
  { autoRefresh: true }
)
```

### Pattern 4: Error Handling
```typescript
const { execute, error } = useWorkflow({
  onError: (err) => {
    console.error('Failed:', err.message)
    // Retry or notify user
  },
  autoRetry: true,
  maxRetries: 3
})
```

## File Locations

| Component | Path |
|-----------|------|
| Service | `/src/lib/workflow/workflow-service.ts` |
| Hooks | `/src/hooks/useWorkflow.ts` |
| Builder | `/src/components/workflow/WorkflowBuilder.tsx` |
| Monitor | `/src/components/workflow/ExecutionMonitor.tsx` |
| API Execute | `/app/api/v1/[tenant]/workflows/[workflowId]/execute/route.ts` |
| API List | `/app/api/v1/[tenant]/workflows/route.ts` |

## Requirements

- Next.js 14+
- React 18+
- TypeScript 5+
- @metabuilder/workflow package

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No executor for node type" | Register in `initializeWorkflowEngine()` |
| "Access denied" | Check tenant matches and auth level |
| "Rate limit exceeded" | Retry after window or increase limit |
| "Execution hangs" | Check workflow timeout setting |

## Next Steps

1. Read `/WORKFLOW_INTEGRATION.md` for full architecture
2. Check `/WORKFLOW_IMPLEMENTATION_CHECKLIST.md` for TODOs
3. Implement DBAL integration in `workflow-service.ts`
4. Register node executors in `initializeWorkflowEngine()`
5. Run tests: `npm run test:e2e`

---

For detailed documentation: See `/WORKFLOW_INTEGRATION.md`
