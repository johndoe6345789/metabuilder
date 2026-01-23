# WorkflowUI - Visual Workflow Editor

Modern, production-grade visual workflow editor inspired by n8n, built for MetaBuilder's DAG executor system.

## 🎯 Overview

WorkflowUI is a full-featured workflow editor with:

- **Visual DAG Editor**: Drag-and-drop node-based workflow construction with React Flow
- **Real-Time Collaboration**: Live updates via Redux and WebSockets
- **Offline-First**: IndexedDB for local workflow storage and sync
- **Plugin Ecosystem**: Support for custom node types and extensions
- **Type-Safe**: Full TypeScript with strict mode enabled

## 🏗️ Architecture

```
Frontend (Next.js + React)
  ├─ UI Components (FakeMUI)
  ├─ Redux Store (state management)
  ├─ React Flow (DAG visualization)
  └─ IndexedDB (offline storage)
       │
       ▼
Backend (Flask + Python)
  ├─ Workflow execution
  ├─ Plugin management
  ├─ Database persistence
  └─ WebSocket server
       │
       ▼
MetaBuilder DAG Executor
  ├─ Node execution
  ├─ Error recovery
  ├─ Multi-tenant support
  └─ Plugin registry
```

## 📦 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 | Server-side rendering, API routes |
| **UI Framework** | FakeMUI | Material UI compatible components |
| **State** | Redux + Redux Toolkit | Centralized state management |
| **Flow Editor** | React Flow | DAG visualization and manipulation |
| **Styling** | SCSS | Component scoped styles |
| **Storage** | IndexedDB (Dexie) | Offline workflow persistence |
| **HTTP** | Axios | API client with interceptors |
| **Backend** | Flask | Python workflow execution |
| **Database** | SQLAlchemy + PostgreSQL/SQLite | Persistent workflow storage |
| **Validation** | n8n JSON Schema | Workflow and node validation |

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 18+
Python 3.11+
npm or yarn
```

### Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
pip install -r backend/requirements.txt

# Initialize IndexedDB
npm run db:init
```

### Development

```bash
# Start both frontend and backend
npm run dev:all

# Or separately:
npm run dev          # Frontend on http://localhost:3000
npm run backend      # Backend on http://localhost:5000
```

### Database Setup

The backend uses SQLAlchemy for database persistence:

```bash
# Default: SQLite (development)
# The database file is created automatically at backend/workflows.db

# PostgreSQL (production)
export DATABASE_URL=postgresql://user:password@localhost/workflows
npm run backend

# Create tables
python -c "from server_sqlalchemy import app, db; app.app_context().push(); db.create_all()"
```

### Build

```bash
npm run build
npm start
```

## 📂 Folder Structure

```
workflowui/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Dashboard page
│   │   ├── editor/[id].tsx     # Workflow editor
│   │   └── api/                # Next.js API routes
│   │
│   ├── components/             # React components
│   │   ├── Editor/             # Workflow editor components
│   │   │   ├── Canvas.tsx      # React Flow canvas
│   │   │   ├── Toolbar.tsx     # Editor toolbar
│   │   │   ├── NodePanel.tsx   # Node configuration panel
│   │   │   └── Properties.tsx  # Node properties panel
│   │   ├── Nodes/              # Custom node types
│   │   │   ├── BaseNode.tsx    # Base node wrapper
│   │   │   ├── PlaywrightNode.tsx
│   │   │   ├── StorybookNode.tsx
│   │   │   └── CustomNode.tsx
│   │   ├── UI/                 # Shared UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Toolbar.tsx
│   │   └── Layout/             # Layout components
│   │       ├── Header.tsx
│   │       └── MainLayout.tsx
│   │
│   ├── store/                  # Redux store
│   │   ├── store.ts            # Store configuration
│   │   ├── slices/
│   │   │   ├── workflowSlice.ts
│   │   │   ├── editorSlice.ts
│   │   │   ├── nodesSlice.ts
│   │   │   ├── connectionSlice.ts
│   │   │   └── uiSlice.ts
│   │   └── types.ts            # Store type definitions
│   │
│   ├── services/               # API/backend services
│   │   ├── workflowService.ts  # Workflow API calls
│   │   ├── nodeService.ts      # Node registry API
│   │   ├── executionService.ts # Workflow execution
│   │   └── storageService.ts   # IndexedDB persistence
│   │
│   ├── db/                     # IndexedDB schema & operations
│   │   ├── schema.ts           # Dexie schema
│   │   ├── workflows.ts        # Workflow queries
│   │   ├── nodes.ts            # Node cache
│   │   └── cache.ts            # Cache operations
│   │
│   ├── hooks/                  # React hooks
│   │   ├── useWorkflow.ts      # Workflow state hook
│   │   ├── useEditor.ts        # Editor state hook
│   │   ├── useNodes.ts         # Node operations hook
│   │   ├── useConnection.ts    # Connection hook
│   │   └── useStorage.ts       # IndexedDB hook
│   │
│   ├── types/                  # TypeScript types
│   │   ├── workflow.ts         # Workflow types
│   │   ├── node.ts             # Node types
│   │   ├── connection.ts       # Connection types
│   │   └── index.ts            # Export all types
│   │
│   ├── utils/                  # Utility functions
│   │   ├── dagValidation.ts    # DAG validation
│   │   ├── nodeFactory.ts      # Node creation factory
│   │   ├── layoutEngine.ts     # Auto-layout algorithm
│   │   ├── jsonValidator.ts    # JSON Schema validation
│   │   └── transformers.ts     # n8n format converters
│   │
│   └── styles/                 # Global styles
│       ├── globals.scss        # Global styles
│       ├── variables.scss      # Design tokens
│       └── mixins.scss         # SCSS mixins
│
├── backend/                    # Flask backend
│   ├── server.py               # Flask app
│   ├── requirements.txt        # Python dependencies
│   ├── routes/
│   │   ├── workflows.py        # Workflow endpoints
│   │   ├── execution.py        # Execution endpoints
│   │   └── nodes.py            # Node registry
│   ├── models/
│   │   ├── workflow.py         # Workflow model
│   │   └── execution.py        # Execution model
│   ├── services/
│   │   ├── executor.py         # Workflow execution
│   │   └── storage.py          # Persistence
│   └── utils/
│       ├── validation.py       # Workflow validation
│       └── converters.py       # Format converters
│
├── workflows/                  # Sample workflows
│   ├── e2e-testing.json
│   ├── documentation.json
│   └── complex-pipeline.json
│
├── stories/                    # Storybook stories
│   ├── Editor.stories.tsx
│   ├── Nodes.stories.tsx
│   └── UI.stories.tsx
│
├── scripts/                    # Build/setup scripts
│   ├── init-db.js              # Initialize IndexedDB
│   └── migrate-db.js           # Database migrations
│
├── public/                     # Static assets
│   └── icons/
│
├── tsconfig.json               # TypeScript config
├── next.config.js              # Next.js config
├── jest.config.js              # Jest config
├── .storybook/                 # Storybook config
└── README.md
```

## 🎨 Key Components

### 1. Canvas (React Flow)

```tsx
// Drag-and-drop DAG editor with zoom, pan, selection
<WorkflowCanvas>
  <ReactFlowProvider>
    <ReactFlow nodes={nodes} edges={edges} onConnect={onConnect}>
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  </ReactFlowProvider>
</WorkflowCanvas>
```

### 2. Node Types

```tsx
// Playwright node example
<PlaywrightNode
  id="test_chromium"
  data={{
    browser: "chromium",
    baseUrl: "http://localhost:3000",
    headless: true
  }}
/>
```

### 3. Redux Store

```typescript
// Central state management
store/slices:
  - workflowSlice: Current workflow, metadata
  - editorSlice: Canvas zoom, pan, selection
  - nodesSlice: Node registry, templates
  - connectionSlice: Edge creation state
  - uiSlice: Modals, panels, notifications
```

### 4. IndexedDB Storage

```typescript
// Offline-first storage with Dexie
db.workflows.put(workflow)
db.workflows.get(id)
db.workflows.toArray()
db.syncWithServer() // Auto-sync when online
```

### 5. Backend API

```python
# Flask endpoints
POST   /api/workflows              # Create workflow
GET    /api/workflows/<id>         # Get workflow
PUT    /api/workflows/<id>         # Update workflow
DELETE /api/workflows/<id>         # Delete workflow
POST   /api/workflows/<id>/execute # Execute workflow
GET    /api/nodes                  # Get node registry
```

## 🔌 Plugin System

Custom node types can be added:

```typescript
// Define custom node
const CustomNode: NodeType = {
  id: 'my.custom',
  name: 'My Custom Node',
  category: 'custom',
  parameters: {
    field1: { type: 'string', required: true },
    field2: { type: 'number', required: false }
  }
};

// Register in node registry
registerNodeType(CustomNode);
```

## 📊 Features

### Visual Editing
- ✅ Drag-and-drop node creation
- ✅ Connection drawing with validation
- ✅ Node selection and multi-select
- ✅ Undo/redo support
- ✅ Auto-layout (horizontal, vertical, hierarchical)
- ✅ Zoom and pan controls
- ✅ Minimap navigation

### Workflow Management
- ✅ Create/edit/delete workflows
- ✅ Version control integration
- ✅ Workflow templates
- ✅ Import/export (JSON, n8n format)
- ✅ Workflow validation (DAG constraints)
- ✅ Multi-tenant support

### Execution
- ✅ Dry-run execution
- ✅ Execution history
- ✅ Result visualization
- ✅ Error reporting
- ✅ Step-by-step debugging
- ✅ Performance metrics

### Developer Experience
- ✅ Hot reload
- ✅ Redux DevTools integration
- ✅ Storybook for component development
- ✅ TypeScript strict mode
- ✅ Comprehensive error messages
- ✅ Debug mode

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm test:watch

# Component development
npm run storybook
```

## 📚 Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md)
- [Component API](./docs/COMPONENTS.md)
- [Redux Store Design](./docs/REDUX.md)
- [IndexedDB Schema](./docs/DATABASE.md)
- [Node Type Reference](./docs/NODE_TYPES.md)
- [API Reference](./docs/API.md)

## 🚀 Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

Deployed with:
- Vercel (Next.js frontend)
- Heroku/Railway (Flask backend)
- MongoDB Atlas (persistent storage)

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Make changes with tests
3. Submit PR with description

## 📄 License

Part of MetaBuilder project

## 🔗 Related

- [MetaBuilder](../README.md)
- [DAG Executor](../workflow/executor/ts)
- [Workflow Plugins](../docs/WORKFLOW_PLUGINS_ARCHITECTURE.md)
- [n8n Format](https://docs.n8n.io)
