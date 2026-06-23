# n8n Workflow Integration Guide
## Bridging MetaBuilder & n8n Ecosystem

**Purpose**: Enable MetaBuilder workflows to use n8n's 500+ connector library while maintaining JSON Script for custom logic.

**Status**: Design doc (implement after MVP)

---

## Executive Summary

n8n is the world's open-source workflow automation platform with:
- ✅ 500+ pre-built connectors (Slack, GitHub, Google Sheets, etc.)
- ✅ Visual node editor with drag-drop UI
- ✅ Community templates and examples
- ✅ Express node for custom JavaScript
- ✅ REST API for programmatic control
- ✅ Docker-ready self-hosted option

**Opportunity**: Instead of building 500 connectors ourselves, integrate n8n's ecosystem.

**Strategy**:
1. Support both n8n JSON format AND native JSON Script
2. Provide conversion layer between formats
3. Use n8n for 90% of connectors, JSON Script for custom logic

---

## Architecture

### Layer 1: n8n Workflows (External)
```json
{
  "id": "workflow_123",
  "name": "Sync Users",
  "nodes": [
    {
      "id": "node_1",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 1,
      "position": [250, 300],
      "parameters": {
        "channel": "general",
        "text": "New user: {{ $json.email }}"
      }
    }
  ],
  "connections": { ... }
}
```

### Layer 2: MetaBuilder Workflows (Native)
```json
{
  "id": "workflow_456",
  "name": "Custom Sync",
  "format": "json-script",
  "version": "2.2.0",
  "nodes": [
    {
      "id": "operation_1",
      "type": "http",
      "op": "call_http",
      "config": {
        "url": "{{ $config.apiUrl }}/sync",
        "method": "POST"
      }
    }
  ]
}
```

### Layer 3: Adapter (Conversion)
```typescript
// workflows/adapters/n8n-to-metabuilder.ts
export function convertN8nToMetaBuilder(n8nWorkflow: N8nWorkflow): MetaBuilderWorkflow {
  return {
    id: n8nWorkflow.id,
    nodes: n8nWorkflow.nodes.map(node => {
      // Convert n8n node to MetaBuilder operation
      if (node.type.startsWith('n8n-nodes-base')) {
        return convertN8nNode(node)  // Maps to built-in operations
      } else if (node.type === 'n8n-nodes-base.code') {
        return {
          type: 'code',
          op: 'execute_code',
          language: 'javascript',
          code: node.parameters.jsCode
        }
      }
    })
  }
}
```

---

## Hybrid Workflow Format

### Option 1: Native n8n Workflows
Use when:
- Workflow is 100% connectors (no custom code)
- High reusability across organizations
- Users want visual editor

Example: "Email new users from GitHub"
```json
{
  "format": "n8n",
  "trigger": "github:push",
  "nodes": [
    { "type": "github:getRepo" },
    { "type": "slack:send" },
    { "type": "email:send" }
  ]
}
```

### Option 2: Native MetaBuilder Workflows
Use when:
- Custom business logic required
- Heavy use of expressions and transformations
- Tight integration with MetaBuilder database

Example: "Sync database after webhook"
```json
{
  "format": "json-script",
  "trigger": "webhook:received",
  "nodes": [
    {
      "type": "operation",
      "op": "transform_data",
      "input": "{{ $json }}",
      "output": "{{ $utils.flatten($json) }}"
    },
    {
      "type": "operation",
      "op": "database_write",
      "entity": "users",
      "data": "{{ $previous.output }}"
    }
  ]
}
```

### Option 3: Hybrid Workflows
Use when:
- Need n8n connectors AND custom code
- Most work is connectors, some custom logic

Example: "Sync GitHub repos, transform, save to database"
```json
{
  "format": "hybrid",
  "nodes": [
    // n8n node (built-in)
    {
      "id": "node_1",
      "type": "github:getRepos",
      "output": "repos"
    },
    // Custom MetaBuilder logic
    {
      "id": "node_2",
      "type": "metabuilder:transform",
      "input": "{{ node_1.output }}",
      "transform": "{{ $utils.mapReposToEntities($json) }}"
    },
    // n8n node (built-in)
    {
      "id": "node_3",
      "type": "database:bulkWrite",
      "entity": "repositories",
      "data": "{{ node_2.output }}"
    }
  ]
}
```

---

## Expression Language

### MetaBuilder Expressions (Template Language)
```
{{ variable }}                    # Direct variable access
{{ object.property }}             # Nested property access
{{ array[0] }}                    # Array indexing
{{ condition ? true : false }}    # Ternary operator
{{ $json }}                       # Current node input
{{ $previous.output }}            # Previous node output
{{ $config.apiKey }}              # Config variables
{{ $utils.func(arg) }}            # Utility functions
```

### Utility Functions Available
```typescript
$utils.flatten()              // Flatten nested objects
$utils.map()                  // Map over arrays
$utils.filter()               // Filter arrays
$utils.find()                 // Find in array
$utils.groupBy()              // Group array elements
$utils.defaults()             // Set default values
$utils.omit()                 // Remove properties
$utils.pick()                 // Select properties
$utils.merge()                // Merge objects
$utils.md5()                  // Hash functions
$utils.now()                  // Current timestamp
$utils.parseJSON()            // Parse JSON strings
$utils.stringify()            // Convert to JSON
```

### n8n Expression Compatibility
```
n8n:  {{ $json.data[0].name }}
MB:   {{ $json.data[0].name }}
✅ Compatible

n8n:  {{ $getMetadata('nodeExecutionOrder') }}
MB:   {{ $metadata.nodeExecutionOrder }}
~   Similar (different namespace)

n8n:  {{ $node['node_name'].json.field }}
MB:   {{ node_name.output.field }}
~   Similar (cleaner in MB)
```

---

## JSON Script v2.3 (n8n Integration)

### Updated Schema
```json
{
  "$schema": "https://metabuilder.dev/schemas/json-script-2.3.json",
  "version": "2.3.0",
  "nodes": [
    {
      "id": "node_1",
      "type": "trigger" | "operation" | "connector",
      "op": "string",
      "format": "native" | "n8n" | "code",

      // For native operations
      "input": "expression?",
      "output": "expression?",
      "config": "object?",

      // For n8n connectors
      "n8nType": "string?",  // e.g. "n8n-nodes-base.slack"
      "parameters": "object?",

      // For code blocks
      "language": "javascript" | "lua" | "python",
      "code": "string?",

      // Error handling
      "onError": {
        "action": "continue" | "retry" | "stop",
        "maxRetries": "number?",
        "retryDelay": "number?"  // milliseconds
      }
    }
  ],
  "connections": [
    {
      "from": "node_1",
      "to": "node_2",
      "mapping": "{{ $previous.output }}"  // How to map output to input
    }
  ]
}
```

### Example: Full Hybrid Workflow

```json
{
  "id": "workflow_hybrid_001",
  "name": "GitHub to Slack: New PRs",
  "version": "2.3.0",
  "format": "hybrid",

  "nodes": [
    {
      "id": "trigger",
      "type": "trigger",
      "op": "github:webhook",
      "config": { "events": ["pull_request"] }
    },
    {
      "id": "filter",
      "type": "operation",
      "op": "filter",
      "input": "{{ $json }}",
      "output": "{{ $json.action === 'opened' ? $json : null }}"
    },
    {
      "id": "transform",
      "type": "operation",
      "op": "transform",
      "input": "{{ filter.output }}",
      "code": "javascript",
      "output": "{{ { title: $json.pull_request.title, url: $json.pull_request.html_url, author: $json.pull_request.user.login } }}"
    },
    {
      "id": "slack_notify",
      "type": "connector",
      "n8nType": "n8n-nodes-base.slack",
      "parameters": {
        "channel": "#github-prs",
        "text": "New PR: {{ transform.output.title }}\nBy: {{ transform.output.author }}\n{{ transform.output.url }}"
      }
    },
    {
      "id": "database_log",
      "type": "operation",
      "op": "database_write",
      "entity": "workflow_events",
      "data": {
        "workflowId": "workflow_hybrid_001",
        "eventType": "pr_opened",
        "payload": "{{ transform.output }}",
        "timestamp": "{{ $utils.now() }}"
      }
    }
  ],

  "connections": [
    { "from": "trigger", "to": "filter" },
    { "from": "filter", "to": "transform" },
    { "from": "transform", "to": "slack_notify" },
    { "from": "slack_notify", "to": "database_log" }
  ]
}
```

---

## Implementation Phases

### Phase 1: Expression Language (Week 1)
- Implement template expression parser
- Add utility functions
- Add expressions to existing workflow system
- Est: 8 hours

### Phase 2: n8n Adapter Layer (Week 2-3)
- Build converter from n8n format to MetaBuilder
- Test with 5-10 common n8n workflows
- Create documentation
- Est: 16 hours

### Phase 3: Visual Editor (Week 4)
- Integrate n8n editor or build custom
- Support drag-drop node creation
- Export to both formats
- Est: 20 hours

### Phase 4: Connector Registry (Week 5)
- Create registry of available connectors
- Map n8n connectors to MetaBuilder operations
- Build connector browser UI
- Est: 12 hours

### Phase 5: Community Templates (Ongoing)
- Create library of pre-built workflows
- Document common patterns
- Add one-click install from template
- Est: Ongoing

---

## Migration Path for Users

### Existing JSON Script Users
1. Old workflows continue to work (native format)
2. New editor can export to both formats
3. Option to convert old workflows to n8n format (if no custom code)
4. No breaking changes

### Users Coming from n8n
1. Import n8n workflows directly
2. Workflows run as-is or optimized versions
3. Can customize with JSON Script logic
4. Gradual migration path

---

## Why Both Formats?

| Aspect | n8n | JSON Script | Winner |
|--------|-----|-----------|--------|
| Connector ecosystem | 500+ pre-built | Need to build | n8n |
| Visual editor | Excellent | Needs building | n8n |
| Custom logic | JS code blocks | Native support | JSON Script |
| Multi-tenant safe | No | Yes | JSON Script |
| Data isolation | No | Yes | JSON Script |
| Type safety | Limited | Full TypeScript | JSON Script |
| Learning curve | Moderate | Steep | n8n |
| Community | Large | Smaller | n8n |

**Conclusion**: Use n8n for connectors, JSON Script for MetaBuilder-specific logic.

---

## API Integration

### Deploy n8n Workflow from MetaBuilder

```typescript
// /api/workflows/convert-and-deploy
export async function POST(req: Request) {
  const { n8nWorkflow } = await req.json()

  // Option 1: Deploy directly to n8n instance
  const response = await fetch('https://n8n.example.com/api/v1/workflows', {
    method: 'POST',
    headers: { 'X-N8N-API-KEY': process.env.N8N_API_KEY },
    body: JSON.stringify(n8nWorkflow)
  })

  // Option 2: Convert to MetaBuilder format and store
  const mbWorkflow = convertN8nToMetaBuilder(n8nWorkflow)
  await db.workflows.create(mbWorkflow)

  return Response.json({ success: true, id: mbWorkflow.id })
}
```

### Trigger n8n Workflow from MetaBuilder

```typescript
// Execute n8n workflow by webhook
await fetch('https://n8n.example.com/webhook/workflow-123', {
  method: 'POST',
  body: JSON.stringify(webhookData)
})
```

---

## Security Considerations

### API Keys
- Never store n8n API keys in code
- Use environment variables
- Rotate keys regularly
- Audit all key usage

### Permissions
- Only God/Supergod can create workflows
- Multi-tenant isolation on all workflows
- Audit log all workflow executions
- Rate limit workflow triggers

### Data Passing
- Sanitize all data passed to n8n
- Validate all data returned from n8n
- Encrypt data in transit (HTTPS only)
- Never pass credentials in workflow definitions

---

## Success Metrics

After implementation:
- ✅ 10x faster workflow creation (using n8n connectors)
- ✅ 500+ connectors available (vs 50 built-in)
- ✅ 50% reduction in custom code needed
- ✅ 90% of workflows drag-drop (no code required)
- ✅ Community templates available for common use cases

---

## Next Steps

1. **Design Phase** ✅ (this document)
2. **Research Phase** (1-2 weeks)
   - Evaluate n8n licensing model
   - Test workflow compatibility
   - Prototype converter
3. **Build Phase** (3-4 weeks)
   - Implement expression language
   - Build n8n adapter
   - Create visual editor integration
4. **Integration Phase** (1-2 weeks)
   - Test with real workflows
   - Document for users
   - Gather feedback

---

**Remember**: We don't need to build 500 connectors. We can borrow n8n's. Focus on making the integration seamless and the UX delightful.
