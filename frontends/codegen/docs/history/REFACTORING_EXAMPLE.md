# Refactoring Example: Breaking Down Large Components

This guide demonstrates how to refactor a monolithic component (FeatureIdeaCloud, ~500 LOC) into smaller, maintainable pieces using the hook library and JSON orchestration.

## Before: Monolithic Component (500+ LOC)

The original `FeatureIdeaCloud.tsx` contains:
- State management for ideas, groups, and connections
- ReactFlow canvas logic
- Dialog management for creating/editing ideas
- AI generation logic
- Connection validation
- All UI rendering

**Problems:**
- Hard to test individual pieces
- Difficult to modify without breaking other parts
- Can't reuse logic in other components
- Takes time to understand the entire component

## After: Modular Architecture (<150 LOC each)

### Step 1: Extract Data Management Hook

```typescript
// src/hooks/feature-ideas/use-idea-manager.ts (60 LOC)
import { useKV } from '@github/spark/hooks'
import { useCallback } from 'react'

export interface FeatureIdea {
  id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high'
  status: 'idea' | 'planned' | 'in-progress' | 'completed'
  createdAt: number
  parentGroup?: string
}

export interface IdeaGroup {
  id: string
  label: string
  color: string
  createdAt: number
}

export interface IdeaConnection {
  id: string
  from: string
  to: string
  createdAt: number
}

export function useIdeaManager() {
  const [ideas, setIdeas] = useKV<FeatureIdea[]>('feature-ideas', [])
  const [groups, setGroups] = useKV<IdeaGroup[]>('idea-groups', [])
  const [connections, setConnections] = useKV<IdeaConnection[]>('idea-connections', [])
  
  const addIdea = useCallback((idea: FeatureIdea) => {
    setIdeas(current => [...current, idea])
  }, [setIdeas])
  
  const updateIdea = useCallback((id: string, updates: Partial<FeatureIdea>) => {
    setIdeas(current => 
      current.map(idea => idea.id === id ? { ...idea, ...updates } : idea)
    )
  }, [setIdeas])
  
  const deleteIdea = useCallback((id: string) => {
    setIdeas(current => current.filter(idea => idea.id !== id))
    setConnections(current => 
      current.filter(conn => conn.from !== id && conn.to !== id)
    )
  }, [setIdeas, setConnections])
  
  return {
    ideas,
    groups,
    connections,
    addIdea,
    updateIdea,
    deleteIdea,
  }
}
```

### Step 2: Extract Canvas Hook

```typescript
// src/hooks/feature-ideas/use-idea-canvas.ts (80 LOC)
import { useNodesState, useEdgesState, Node, Edge } from 'reactflow'
import { useCallback, useEffect } from 'react'
import { FeatureIdea, IdeaConnection } from './use-idea-manager'

export function useIdeaCanvas(ideas: FeatureIdea[], connections: IdeaConnection[]) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  
  useEffect(() => {
    const newNodes: Node[] = ideas.map(idea => ({
      id: idea.id,
      type: 'ideaNode',
      position: { x: 0, y: 0 },
      data: { idea }
    }))
    setNodes(newNodes)
  }, [ideas, setNodes])
  
  useEffect(() => {
    const newEdges: Edge[] = connections.map(conn => ({
      id: conn.id,
      source: conn.from,
      target: conn.to,
      type: 'smoothstep'
    }))
    setEdges(newEdges)
  }, [connections, setEdges])
  
  const updateNodePosition = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setNodes(current =>
      current.map(node =>
        node.id === nodeId ? { ...node, position } : node
      )
    )
  }, [setNodes])
  
  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    updateNodePosition
  }
}
```

### Step 3: Extract Connection Logic Hook

```typescript
// src/hooks/feature-ideas/use-idea-connections.ts (70 LOC)
import { useCallback } from 'react'
import { Connection as RFConnection } from 'reactflow'
import { IdeaConnection } from './use-idea-manager'

export function useIdeaConnections(
  connections: IdeaConnection[],
  onAdd: (conn: IdeaConnection) => void,
  onRemove: (id: string) => void
) {
  const canConnect = useCallback((from: string, to: string) => {
    if (from === to) return false
    
    const existingConnection = connections.find(
      conn => conn.from === from && conn.to === to
    )
    
    return !existingConnection
  }, [connections])
  
  const addConnection = useCallback((connection: RFConnection) => {
    if (!canConnect(connection.source, connection.target)) {
      return false
    }
    
    const newConnection: IdeaConnection = {
      id: `${connection.source}-${connection.target}`,
      from: connection.source,
      to: connection.target,
      createdAt: Date.now()
    }
    
    onAdd(newConnection)
    return true
  }, [canConnect, onAdd])
  
  const removeConnection = useCallback((id: string) => {
    onRemove(id)
  }, [onRemove])
  
  return {
    canConnect,
    addConnection,
    removeConnection
  }
}
```

### Step 4: Create Small UI Components

```typescript
// src/components/feature-ideas/IdeaNode.tsx (50 LOC)
import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FeatureIdea } from '@/hooks/feature-ideas/use-idea-manager'

interface IdeaNodeProps {
  idea: FeatureIdea
  onEdit: () => void
  onDelete: () => void
}

export const IdeaNode = memo(({ idea, onEdit, onDelete }: IdeaNodeProps) => {
  return (
    <Card className="p-3 min-w-[200px]">
      <Handle type="target" position={Position.Left} />
      
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-sm">{idea.title}</h3>
        <Badge variant={getPriorityVariant(idea.priority)}>
          {idea.priority}
        </Badge>
      </div>
      
      <p className="text-xs text-muted-foreground mb-2">
        {idea.description}
      </p>
      
      <div className="flex gap-1">
        <button onClick={onEdit} className="text-xs">Edit</button>
        <button onClick={onDelete} className="text-xs text-destructive">
          Delete
        </button>
      </div>
      
      <Handle type="source" position={Position.Right} />
    </Card>
  )
})

function getPriorityVariant(priority: string) {
  switch (priority) {
    case 'high': return 'destructive'
    case 'medium': return 'default'
    default: return 'secondary'
  }
}
```

```typescript
// src/components/feature-ideas/IdeaToolbar.tsx (40 LOC)
import { Button } from '@/components/ui/button'
import { Plus, Sparkle } from '@phosphor-icons/react'

interface IdeaToolbarProps {
  onAddIdea: () => void
  onGenerateAI: () => void
  ideaCount: number
}

export function IdeaToolbar({ onAddIdea, onGenerateAI, ideaCount }: IdeaToolbarProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div>
        <h2 className="text-lg font-semibold">Feature Ideas</h2>
        <p className="text-sm text-muted-foreground">
          {ideaCount} ideas
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button onClick={onAddIdea} variant="outline">
          <Plus className="mr-2" size={16} />
          Add Idea
        </Button>
        <Button onClick={onGenerateAI}>
          <Sparkle className="mr-2" size={16} />
          AI Generate
        </Button>
      </div>
    </div>
  )
}
```

### Step 5: Compose Main Component

```typescript
// src/components/FeatureIdeaCloud.tsx (120 LOC)
import ReactFlow, { Background, Controls } from 'reactflow'
import 'reactflow/dist/style.css'
import { useIdeaManager } from '@/hooks/feature-ideas/use-idea-manager'
import { useIdeaCanvas } from '@/hooks/feature-ideas/use-idea-canvas'
import { useIdeaConnections } from '@/hooks/feature-ideas/use-idea-connections'
import { useDialog } from '@/hooks/ui/use-dialog'
import { IdeaNode } from './feature-ideas/IdeaNode'
import { IdeaToolbar } from './feature-ideas/IdeaToolbar'
import { IdeaDialog } from './feature-ideas/IdeaDialog'

const nodeTypes = {
  ideaNode: IdeaNode
}

export function FeatureIdeaCloud() {
  const {
    ideas,
    connections,
    addIdea,
    updateIdea,
    deleteIdea
  } = useIdeaManager()
  
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange
  } = useIdeaCanvas(ideas, connections)
  
  const {
    addConnection,
    removeConnection
  } = useIdeaConnections(connections, addIdea, deleteIdea)
  
  const { isOpen, open, close } = useDialog()
  
  return (
    <div className="h-full flex flex-col">
      <IdeaToolbar
        onAddIdea={open}
        onGenerateAI={handleAIGenerate}
        ideaCount={ideas.length}
      />
      
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={addConnection}
          nodeTypes={nodeTypes}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      
      <IdeaDialog
        open={isOpen}
        onClose={close}
        onSave={addIdea}
      />
    </div>
  )
}

async function handleAIGenerate() {
  // AI generation logic
}
```

### Step 6: Define as JSON (Optional)

```json
{
  "id": "feature-idea-cloud",
  "name": "Feature Idea Cloud",
  "description": "Visual brainstorming canvas for features",
  "layout": {
    "type": "single"
  },
  "components": [
    {
      "id": "toolbar",
      "type": "IdeaToolbar",
      "bindings": [
        {
          "source": "ideas.length",
          "target": "ideaCount"
        }
      ],
      "events": [
        {
          "event": "onAddIdea",
          "action": "open-dialog"
        },
        {
          "event": "onGenerateAI",
          "action": "ai-generate-ideas"
        }
      ]
    },
    {
      "id": "canvas",
      "type": "IdeaCanvas",
      "bindings": [
        {
          "source": "ideas",
          "target": "ideas"
        },
        {
          "source": "connections",
          "target": "connections"
        }
      ]
    }
  ],
  "hooks": [
    {
      "id": "ideas",
      "name": "useIdeaManager",
      "exports": ["ideas", "connections", "addIdea", "updateIdea", "deleteIdea"]
    },
    {
      "id": "dialog",
      "name": "useDialog",
      "exports": ["isOpen", "open", "close"]
    }
  ],
  "actions": [
    {
      "id": "open-dialog",
      "type": "custom",
      "handler": "open"
    },
    {
      "id": "ai-generate-ideas",
      "type": "ai-generate",
      "params": {
        "prompt": "Generate 5 creative feature ideas for a project management tool",
        "target": "Ideas"
      }
    }
  ]
}
```

## Benefits Achieved

### 1. Component Size Reduction

| Component | Before | After |
|-----------|--------|-------|
| FeatureIdeaCloud | 500 LOC | 120 LOC |
| Hooks | 0 | 210 LOC (3 files) |
| UI Components | 0 | 90 LOC (2 files) |

### 2. Testability

```typescript
// Easy to test individual hooks
describe('useIdeaManager', () => {
  it('should add idea', () => {
    const { result } = renderHook(() => useIdeaManager())
    act(() => {
      result.current.addIdea(mockIdea)
    })
    expect(result.current.ideas).toHaveLength(1)
  })
})

// Easy to test UI components
describe('IdeaNode', () => {
  it('should call onEdit when edit clicked', () => {
    const onEdit = jest.fn()
    const { getByText } = render(<IdeaNode idea={mockIdea} onEdit={onEdit} />)
    fireEvent.click(getByText('Edit'))
    expect(onEdit).toHaveBeenCalled()
  })
})
```

### 3. Reusability

```typescript
// Use the same hooks in different contexts
function IdeaList() {
  const { ideas, updateIdea } = useIdeaManager()
  return <div>{/* List view instead of canvas */}</div>
}

function IdeaKanban() {
  const { ideas, updateIdea } = useIdeaManager()
  return <div>{/* Kanban board view */}</div>
}
```

### 4. Maintainability

- Each file has a single responsibility
- Easy to locate and fix bugs
- Changes to canvas don't affect data management
- New features can be added without touching existing code

### 5. Type Safety

- Shared types between hooks and components
- Auto-completion in IDE
- Compile-time error checking

## Migration Strategy

### Phase 1: Extract Hooks (Don't break existing code)

1. Create new hook files
2. Copy logic from component to hooks
3. Test hooks independently
4. Keep original component working

### Phase 2: Refactor Component

1. Replace inline logic with hook calls
2. Test that behavior is identical
3. Remove commented-out old code

### Phase 3: Extract UI Components

1. Identify reusable UI patterns
2. Create small components
3. Replace inline JSX with components

### Phase 4: Create JSON Schema (Optional)

1. Define page schema for dynamic loading
2. Test schema with PageRenderer
3. Switch to schema-driven approach

## Additional Examples

### Example: Breaking Down ModelDesigner

**Before:** 400 LOC monolithic component

**After:**
- `use-model-state.ts` (50 LOC) - Model data management
- `use-field-editor.ts` (40 LOC) - Field editing logic
- `use-relation-builder.ts` (45 LOC) - Relation logic
- `ModelCard.tsx` (60 LOC) - Individual model display
- `FieldList.tsx` (50 LOC) - Field list UI
- `RelationGraph.tsx` (80 LOC) - Visual relation graph
- `ModelDesigner.tsx` (130 LOC) - Main orchestration

**Total:** 455 LOC across 7 files (vs 400 LOC in 1 file)
**Benefit:** Each piece is testable and reusable

### Example: Breaking Down WorkflowDesigner

**Before:** 600 LOC monolithic component

**After:**
- `use-workflow-state.ts` (55 LOC)
- `use-node-manager.ts` (60 LOC)
- `use-workflow-canvas.ts` (75 LOC)
- `WorkflowNode.tsx` (80 LOC)
- `NodeConfig.tsx` (90 LOC)
- `WorkflowToolbar.tsx` (50 LOC)
- `WorkflowDesigner.tsx` (140 LOC)

**Total:** 550 LOC across 7 files
**Benefit:** Canvas logic separated from node configuration

## Checklist for Refactoring

- [ ] Identify data management logic → Extract to hook
- [ ] Identify UI state logic → Extract to hook
- [ ] Identify reusable UI patterns → Extract to components
- [ ] Ensure all pieces are under 150 LOC
- [ ] Write tests for hooks
- [ ] Write tests for components
- [ ] Document hook APIs
- [ ] Create JSON schema if applicable
- [ ] Update imports in dependent files
- [ ] Remove old code

## Next Steps

1. Start with the largest components first
2. Use this pattern as a template
3. Create additional hooks as needed
4. Build a library of reusable UI components
5. Define common pages as JSON schemas
6. Document all new hooks and components
