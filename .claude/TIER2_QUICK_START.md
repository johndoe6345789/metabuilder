# Tier 2 Hooks - Quick Start Guide

## Installation

All packages are in the root monorepo workspaces:

```bash
npm install
```

## Setup (App-Level Initialization)

### Step 1: Create Service Adapters

```typescript
// src/services/setupServices.ts
import {
  DefaultProjectServiceAdapter,
  DefaultWorkspaceServiceAdapter,
  DefaultWorkflowServiceAdapter,
  DefaultExecutionServiceAdapter,
  DefaultAuthServiceAdapter,
  type IServiceProviders,
} from '@metabuilder/service-adapters'

export function createServices(): IServiceProviders {
  return {
    projectService: new DefaultProjectServiceAdapter('/api'),
    workspaceService: new DefaultWorkspaceServiceAdapter('/api'),
    workflowService: new DefaultWorkflowServiceAdapter('/api'),
    executionService: new DefaultExecutionServiceAdapter('/api'),
    authService: new DefaultAuthServiceAdapter('/api'),
  }
}
```

### Step 2: Wrap App with ServiceProvider

```typescript
// src/app.tsx
import { ServiceProvider } from '@metabuilder/service-adapters'
import { createServices } from './services/setupServices'

const services = createServices()

export function App() {
  return (
    <ServiceProvider services={services}>
      <YourAppComponents />
    </ServiceProvider>
  )
}
```

## Using Tier 2 Data Hooks

### useProject

```typescript
import { useProject } from '@metabuilder/hooks-data'

function ProjectManager() {
  const { projects, currentProject, isLoading, error, loadProjects, createProject } = useProject()

  useEffect(() => {
    loadProjects('workspace-123')
  }, [])

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {projects.map(p => <div key={p.id}>{p.name}</div>)}
    </div>
  )
}
```

### useWorkspace

```typescript
import { useWorkspace } from '@metabuilder/hooks-data'

function WorkspaceManager() {
  const { workspaces, currentWorkspace, loadWorkspaces, createWorkspace } = useWorkspace()

  // Auto-loads on init
  return (
    <div>
      {workspaces.map(w => <div key={w.id}>{w.name}</div>)}
    </div>
  )
}
```

### useWorkflow

```typescript
import { useWorkflow } from '@metabuilder/hooks-data'

function WorkflowEditor() {
  const { workflow, nodes, connections, validate, getMetrics, addNode } = useWorkflow()

  const handleAddNode = (node: WorkflowNode) => {
    addNode(node)
    // Auto-saves with 2-second debounce
  }

  return (
    <div>
      {/* Render workflow editor */}
    </div>
  )
}
```

### useExecution

```typescript
import { useExecution } from '@metabuilder/hooks-data'

function ExecutionMonitor() {
  const { currentExecution, executionHistory, execute, getHistory } = useExecution()

  const handleExecute = async () => {
    const result = await execute('workflow-123', { input: 'value' })
    console.log(result.status)
  }

  return (
    <div>
      {currentExecution && <p>Running: {currentExecution.workflowName}</p>}
    </div>
  )
}
```

## Using Tier 2 Auth Hooks

### useLoginLogic

```typescript
import { useLoginLogic } from '@metabuilder/hooks-auth'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { handleLogin } = useLoginLogic()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await handleLogin({ email, password })
      // Automatically redirects to dashboard on success
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  )
}
```

### useRegisterLogic

```typescript
import { useRegisterLogic } from '@metabuilder/hooks-auth'

function RegisterForm() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const { handleRegister } = useRegisterLogic()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await handleRegister(formData)
      // Automatically redirects to dashboard on success
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Name" />
      <input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="Email" />
      <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Password" />
      <input type="password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="Confirm Password" />
      <button type="submit">Register</button>
    </form>
  )
}
```

### usePasswordValidation

```typescript
import { usePasswordValidation } from '@metabuilder/hooks-auth'

function PasswordInput() {
  const { passwordStrength, validatePassword, handlePasswordChange } = usePasswordValidation()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlePasswordChange(e.target.value)
  }

  const strengthMessages = ['', 'Weak', 'Fair', 'Good', 'Strong']

  return (
    <div>
      <input type="password" onChange={handleChange} placeholder="Password" />
      <div>Strength: {strengthMessages[passwordStrength]}</div>
    </div>
  )
}
```

## Using Tier 2 Canvas Hooks

### useCanvasItems

```typescript
import { useCanvasItems } from '@metabuilder/hooks-canvas'

function CanvasView() {
  const { canvasItems, loadCanvasItems, deleteCanvasItem, isResizing } = useCanvasItems()

  // Auto-loads when project changes
  return (
    <div>
      {canvasItems.map(item => (
        <div key={item.id}>
          <span>{item.workflowId}</span>
          <button onClick={() => deleteCanvasItem(item.id)}>Remove</button>
        </div>
      ))}
    </div>
  )
}
```

### useCanvasItemsOperations

```typescript
import { useCanvasItemsOperations } from '@metabuilder/hooks-canvas'

function CanvasControls() {
  const { createCanvasItem, updateCanvasItem, bulkUpdateItems } = useCanvasItemsOperations()

  const handleAddWorkflow = async (workflowId: string) => {
    await createCanvasItem({
      workflowId,
      x: 100,
      y: 100,
      width: 200,
      height: 150,
    })
  }

  return (
    <button onClick={() => handleAddWorkflow('workflow-123')}>Add Workflow</button>
  )
}
```

## Testing with Mock Adapters

```typescript
import { render, screen } from '@testing-library/react'
import { ServiceProvider, MockAdapters } from '@metabuilder/service-adapters'
import { useProject } from '@metabuilder/hooks-data'

function TestComponent() {
  const { projects } = useProject()
  return <div>{projects.length} projects</div>
}

test('loads projects', async () => {
  const mockServices = {
    projectService: new MockAdapters.ProjectServiceAdapter(),
    workspaceService: new MockAdapters.WorkspaceServiceAdapter(),
    workflowService: new MockAdapters.WorkflowServiceAdapter(),
    executionService: new MockAdapters.ExecutionServiceAdapter(),
    authService: new MockAdapters.AuthServiceAdapter(),
  }

  render(
    <ServiceProvider services={mockServices}>
      <TestComponent />
    </ServiceProvider>
  )

  expect(screen.getByText('0 projects')).toBeInTheDocument()
})
```

## Service Adapter Methods Reference

### IProjectServiceAdapter
```typescript
listProjects(tenantId: string, workspaceId?: string): Promise<Project[]>
getProject(id: string): Promise<Project>
createProject(data: CreateProjectRequest): Promise<Project>
updateProject(id: string, data: UpdateProjectRequest): Promise<Project>
deleteProject(id: string): Promise<void>
getCanvasItems(projectId: string): Promise<ProjectCanvasItem[]>
createCanvasItem(projectId: string, data: CreateCanvasItemRequest): Promise<ProjectCanvasItem>
updateCanvasItem(projectId: string, itemId: string, data: UpdateCanvasItemRequest): Promise<ProjectCanvasItem>
deleteCanvasItem(projectId: string, itemId: string): Promise<void>
bulkUpdateCanvasItems(projectId: string, updates: Array<Partial<ProjectCanvasItem> & { id: string }>): Promise<ProjectCanvasItem[]>
```

### IWorkspaceServiceAdapter
```typescript
listWorkspaces(tenantId: string): Promise<Workspace[]>
getWorkspace(id: string): Promise<Workspace>
createWorkspace(data: CreateWorkspaceRequest): Promise<Workspace>
updateWorkspace(id: string, data: UpdateWorkspaceRequest): Promise<Workspace>
deleteWorkspace(id: string): Promise<void>
```

### IWorkflowServiceAdapter
```typescript
createWorkflow(data: { name: string; description?: string; tenantId: string }): Promise<Workflow>
getWorkflow(workflowId: string, tenantId: string): Promise<Workflow | undefined>
listWorkflows(tenantId: string): Promise<Workflow[]>
saveWorkflow(workflow: Workflow): Promise<void>
deleteWorkflow(workflowId: string, tenantId: string): Promise<void>
validateWorkflow(workflowId: string, workflow: Workflow): Promise<{ valid: boolean; errors: string[]; warnings: string[] }>
getWorkflowMetrics(workflow: Workflow): Promise<{ nodeCount: number; connectionCount: number; complexity: 'simple' | 'moderate' | 'complex'; depth: number }>
```

### IExecutionServiceAdapter
```typescript
executeWorkflow(workflowId: string, data: { nodes: any[]; connections: any[]; inputs?: Record<string, any> }, tenantId?: string): Promise<ExecutionResult>
cancelExecution(executionId: string): Promise<void>
getExecutionDetails(executionId: string): Promise<ExecutionResult | null>
getExecutionStats(workflowId: string, tenantId?: string): Promise<ExecutionStats>
getExecutionHistory(workflowId: string, tenantId?: string, limit?: number): Promise<ExecutionResult[]>
```

### IAuthServiceAdapter
```typescript
login(email: string, password: string): Promise<AuthResponse>
register(email: string, password: string, name: string): Promise<AuthResponse>
logout(): Promise<void>
getCurrentUser(): Promise<User>
isAuthenticated(): boolean
getToken(): string | null
getUser(): User | null
```

## Environment Configuration

### Production
```typescript
const services = {
  projectService: new DefaultProjectServiceAdapter('https://api.example.com'),
  workspaceService: new DefaultWorkspaceServiceAdapter('https://api.example.com'),
  // ...
}
```

### Development
```typescript
const services = {
  projectService: new DefaultProjectServiceAdapter('http://localhost:3001'),
  workspaceService: new DefaultWorkspaceServiceAdapter('http://localhost:3001'),
  // ...
}
```

### Testing
```typescript
const services = {
  projectService: new MockProjectServiceAdapter(),
  workspaceService: new MockWorkspaceServiceAdapter(),
  // ...
}
```

## Type Imports

```typescript
import type {
  Project,
  Workspace,
  Workflow,
  WorkflowNode,
  ExecutionResult,
  ExecutionStats,
  User,
  AuthResponse,
} from '@metabuilder/service-adapters'
```

## Common Patterns

### Loading Data on Mount
```typescript
useEffect(() => {
  loadProjects('workspace-123')
}, [loadProjects])
```

### Error Handling
```typescript
try {
  await createProject({ name: 'New Project', workspaceId: 'ws-1' })
} catch (error) {
  console.error('Failed to create project:', error.message)
}
```

### Conditional Rendering
```typescript
{isLoading && <Spinner />}
{error && <ErrorMessage message={error} />}
{data && <Content data={data} />}
```

## Troubleshooting

### "useServices must be used within ServiceProvider"
Make sure your component tree is wrapped with `<ServiceProvider>` at the root.

### Mock Adapters Not Working
Check that you're using `new MockProjectServiceAdapter()` (with `new` keyword).

### Service Not Injected
Verify ServiceProvider is above the component using the hook in the React tree.

---

**All Tier 2 hooks are ready for use. See individual package docs for detailed API references.**
