# MetaBuilder: Universal Platform Architecture

**Status**: Design Phase
**Vision**: One cohesive system for code, 3D, graphics, media, and system administration

---

## Core Philosophy

Modern computing is fragmented. Users need dozens of apps with different paradigms, file formats, and learning curves. MetaBuilder provides a unified platform where:

- **95% Data, 5% Code** - Everything is JSON configuration
- **Three Frontends, One State** - CLI, Qt6, Web are projections of the same state machine
- **Hot-Loadable Capabilities** - Modules load on demand, not monolithic
- **Userland OS** - Not replacing the kernel, but unifying the application layer

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTENDS                                       │
├─────────────────┬─────────────────────┬─────────────────────────────────────┤
│   CLI Frontend  │   Qt6 Frontend      │   Web Frontend (Next.js)            │
│   (Commander)   │   (Native Desktop)  │   (Browser/Electron/Tauri)          │
└────────┬────────┴──────────┬──────────┴──────────────────┬──────────────────┘
         │                   │                              │
         └───────────────────┼──────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  FRONTEND BUS   │
                    │  (WebSocket/IPC)│
                    └────────┬────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────────────┐
│                           METABUILDER CORE                                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ State Machine│ │ Command Bus  │ │ Event Stream │ │ Entity Graph │        │
│  │ (XState-like)│ │ (CQRS)       │ │ (Pub/Sub)    │ │ (DBAL)       │        │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Undo/Redo    │ │ Job Scheduler│ │ Plugin Host  │ │ VFS Layer    │        │
│  │ (Event Src)  │ │ (DAG Engine) │ │ (Registry)   │ │ (Abstraction)│        │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│                        CAPABILITY MODULES                                    │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────────────┤
│   CODE      │   GRAPHICS  │    3D       │   MEDIA     │   SYSTEM            │
│   ────      │   ────────  │    ──       │   ─────     │   ──────            │
│ • Editor    │ • Raster    │ • Modeling  │ • Audio     │ • Files             │
│ • LSP Host  │ • Vector    │ • Sculpting │ • Video     │ • Processes         │
│ • Debugger  │ • Compositor│ • Animation │ • Streaming │ • Network           │
│ • Builder   │ • Filters   │ • Physics   │ • Recording │ • Hardware          │
│ • VCS       │ • AI Gen    │ • Rendering │ • Encoding  │ • Containers        │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────────────┤
│   GAME      │   DATA      │   DOCS      │   COMMS     │   AI                │
│   ────      │   ────      │   ────      │   ─────     │   ──                │
│ • Engine    │ • Database  │ • Writer    │ • Chat      │ • Local LLM         │
│ • Physics   │ • Sheets    │ • Slides    │ • Email     │ • Image Gen         │
│ • Audio     │ • Graphs    │ • Diagrams  │ • Calendar  │ • Code Assist       │
│ • Assets    │ • ETL       │ • PDF       │ • Tasks     │ • Agents            │
│ • Scripting │ • Analytics │ • Publishing│ • Contacts  │ • Embeddings        │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│                         RUNTIME LAYER                                        │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐                │
│  │ Native     │ │ WASM       │ │ Workflow   │ │ GPU        │                │
│  │ (C++/TS)   │ │ (Portable) │ │ (JSON DAG) │ │ (Compute)  │                │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Mapping to Existing MetaBuilder Components

| Architecture Layer | Existing Component | Location |
|-------------------|-------------------|----------|
| Entity Graph | DBAL | `dbal/` |
| Job Scheduler | DAG Executor | `workflow/executor/ts/executor/` |
| Plugin Host | Node Executor Registry | `workflow/executor/ts/registry/` |
| Workflow Runtime | Python/TS Plugins | `workflow/plugins/` |
| Web Frontend | Next.js App | `frontends/nextjs/` |
| VFS Layer | (New) | - |
| State Machine | (New) | - |
| Command Bus | (New) | - |

---

## Core Subsystems

### 1. State Machine (New)

Central state management with XState-like semantics:

```typescript
// core/state-machine/index.ts
interface AppState {
  mode: 'code' | 'graphics' | '3d' | 'media' | 'data';
  activeDocument: DocumentRef | null;
  selection: SelectionSet;
  clipboard: ClipboardData;
  undoStack: Command[];
  redoStack: Command[];
}

interface StateMachine {
  getState(): AppState;
  dispatch(command: Command): void;
  subscribe(listener: StateListener): Unsubscribe;
  canUndo(): boolean;
  canRedo(): boolean;
  undo(): void;
  redo(): void;
}
```

### 2. Command Bus (New)

CQRS-style command/query separation:

```typescript
// core/command-bus/index.ts
interface Command {
  type: string;
  payload: unknown;
  metadata: {
    timestamp: number;
    source: 'cli' | 'qt6' | 'web';
    userId?: string;
    tenantId?: string;
  };
}

interface CommandBus {
  execute(command: Command): Promise<CommandResult>;
  query(query: Query): Promise<QueryResult>;
  registerHandler(type: string, handler: CommandHandler): void;
}
```

### 3. Event Stream (New)

Pub/sub for cross-module communication:

```typescript
// core/event-stream/index.ts
interface Event {
  type: string;
  payload: unknown;
  timestamp: number;
  source: string;
}

interface EventStream {
  publish(event: Event): void;
  subscribe(pattern: string, handler: EventHandler): Unsubscribe;
  replay(from: number, to?: number): Event[];
}
```

### 4. VFS Layer (New)

Virtual filesystem abstraction:

```typescript
// core/vfs/index.ts
interface VFS {
  // Unified interface for local, remote, virtual files
  read(path: VFSPath): Promise<Buffer>;
  write(path: VFSPath, data: Buffer): Promise<void>;
  list(path: VFSPath): Promise<VFSEntry[]>;
  watch(path: VFSPath, handler: WatchHandler): Unsubscribe;

  // Mount points
  mount(prefix: string, provider: VFSProvider): void;
  unmount(prefix: string): void;
}

// Providers
interface VFSProvider {
  read(path: string): Promise<Buffer>;
  write(path: string, data: Buffer): Promise<void>;
  list(path: string): Promise<VFSEntry[]>;
  watch?(path: string, handler: WatchHandler): Unsubscribe;
}

// Built-in providers
// - LocalFSProvider (native filesystem)
// - MemoryFSProvider (in-memory)
// - S3Provider (cloud storage)
// - GitProvider (git repositories)
// - HTTPProvider (remote URLs)
```

### 5. Frontend Bus (New)

WebSocket/IPC bridge for frontend sync:

```typescript
// core/frontend-bus/index.ts
interface FrontendBus {
  // Send to all connected frontends
  broadcast(message: BusMessage): void;

  // Send to specific frontend
  send(frontendId: string, message: BusMessage): void;

  // Receive from frontends
  onMessage(handler: MessageHandler): Unsubscribe;

  // Frontend lifecycle
  onConnect(handler: ConnectHandler): Unsubscribe;
  onDisconnect(handler: DisconnectHandler): Unsubscribe;
}

interface BusMessage {
  type: 'command' | 'query' | 'event' | 'sync';
  payload: unknown;
}
```

---

## Capability Module Interface

All capability modules implement a standard interface:

```typescript
// core/capability/index.ts
interface CapabilityModule {
  // Metadata
  id: string;
  name: string;
  version: string;
  category: CapabilityCategory;
  dependencies: string[];

  // Lifecycle
  initialize(core: MetaBuilderCore): Promise<void>;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  dispose(): Promise<void>;

  // Commands this module handles
  commands: CommandDefinition[];

  // Events this module emits
  events: EventDefinition[];

  // UI contributions (panels, menus, etc.)
  contributions: UIContribution[];
}

type CapabilityCategory =
  | 'code' | 'graphics' | '3d' | 'media' | 'system'
  | 'game' | 'data' | 'docs' | 'comms' | 'ai';
```

---

## Runtime Layer

### Native Runtime (C++/TypeScript)

For performance-critical operations:

```
workflow/executor/ts/     # TypeScript (orchestration)
workflow/executor/cpp/    # C++ via FFI (bulk operations)
```

### WASM Runtime

For portable, sandboxed execution:

```typescript
// runtime/wasm/index.ts
interface WASMRuntime {
  loadModule(path: string): Promise<WASMModule>;
  execute(module: WASMModule, fn: string, args: unknown[]): Promise<unknown>;
  getMemory(module: WASMModule): ArrayBuffer;
}
```

### Workflow Runtime (JSON DAG)

The existing workflow engine becomes the scripting layer:

```
workflow/executor/        # Language runtimes
workflow/plugins/         # Plugin implementations
workflow/examples/        # Example workflows
```

### GPU Runtime

For compute shaders and graphics:

```typescript
// runtime/gpu/index.ts
interface GPURuntime {
  // WebGPU abstraction
  createBuffer(descriptor: BufferDescriptor): GPUBuffer;
  createTexture(descriptor: TextureDescriptor): GPUTexture;
  createPipeline(descriptor: PipelineDescriptor): GPUPipeline;
  submit(commands: GPUCommandBuffer[]): void;

  // Compute shaders
  dispatch(pipeline: GPUPipeline, workgroups: [number, number, number]): void;
}
```

---

## Directory Structure

```
metabuilder/
├── core/                      # Core subsystems (NEW)
│   ├── state-machine/         # Central state management
│   ├── command-bus/           # CQRS command handling
│   ├── event-stream/          # Pub/sub events
│   ├── vfs/                   # Virtual filesystem
│   ├── frontend-bus/          # Frontend synchronization
│   └── index.ts               # Core exports
│
├── capabilities/              # Capability modules (NEW)
│   ├── code/                  # Code editing, LSP, debugging
│   ├── graphics/              # Raster, vector, compositor
│   ├── 3d/                    # Modeling, sculpting, rendering
│   ├── media/                 # Audio, video, streaming
│   ├── system/                # Files, processes, network
│   ├── game/                  # Game engine, physics, assets
│   ├── data/                  # Database, sheets, analytics
│   ├── docs/                  # Writer, slides, diagrams
│   ├── comms/                 # Chat, email, calendar
│   └── ai/                    # LLM, image gen, agents
│
├── runtime/                   # Runtime layer (NEW)
│   ├── wasm/                  # WASM execution
│   └── gpu/                   # GPU compute
│
├── workflow/                  # Workflow subsystem (EXISTING)
│   ├── executor/              # Language runtimes
│   ├── plugins/               # Plugin implementations
│   └── examples/              # Example workflows
│
├── dbal/                      # Data layer (EXISTING)
│   ├── development/           # TypeScript DBAL
│   └── shared/                # Shared schemas
│
├── frontends/                 # Frontend projections (EXISTING)
│   ├── nextjs/                # Web frontend
│   ├── cli/                   # CLI frontend (NEW)
│   └── qt6/                   # Native desktop (NEW)
│
└── packages/                  # User packages (EXISTING)
```

---

## Implementation Phases

### Phase 1: Core Infrastructure
- [ ] State Machine implementation
- [ ] Command Bus implementation
- [ ] Event Stream implementation
- [ ] VFS Layer with local provider
- [ ] Frontend Bus (WebSocket)

### Phase 2: Code Capability (MVP)
- [ ] Code editor integration (Monaco/CodeMirror)
- [ ] LSP host for language support
- [ ] Basic file operations via VFS
- [ ] Git integration

### Phase 3: Data Capability
- [ ] Database viewer/editor
- [ ] Spreadsheet component
- [ ] Query builder
- [ ] Data visualization

### Phase 4: Additional Frontends
- [ ] CLI frontend (Commander.js)
- [ ] Qt6 frontend (native desktop)
- [ ] Frontend synchronization

### Phase 5: Graphics/3D/Media
- [ ] Canvas-based graphics editor
- [ ] WebGPU 3D renderer
- [ ] Audio/video processing

### Phase 6: AI Integration
- [ ] Local LLM support (llama.cpp)
- [ ] Image generation
- [ ] Code assistance
- [ ] Workflow agents

---

## Key Design Decisions

### 1. JSON-First Configuration

All capability modules are configured via JSON:

```json
{
  "id": "cap_code_editor",
  "name": "Code Editor",
  "category": "code",
  "config": {
    "defaultLanguage": "typescript",
    "theme": "dark",
    "fontSize": 14
  },
  "keybindings": [
    { "key": "cmd+s", "command": "file.save" },
    { "key": "cmd+p", "command": "file.quickOpen" }
  ]
}
```

### 2. Multi-Tenant by Default

Every operation respects tenant boundaries:

```typescript
interface CommandContext {
  tenantId: string;
  userId: string;
  permissions: Permission[];
}
```

### 3. Event Sourcing for Undo/Redo

All mutations are recorded as events:

```typescript
interface MutationEvent {
  type: 'mutation';
  command: Command;
  previousState: Partial<AppState>;
  newState: Partial<AppState>;
  timestamp: number;
}
```

### 4. Hot-Loadable Modules

Capabilities load on demand:

```typescript
// Lazy loading
const codeCapability = await core.loadCapability('code');

// Hot reload during development
core.reloadCapability('code');
```

### 5. Unified Document Model

All documents share a common interface:

```typescript
interface Document {
  id: string;
  type: DocumentType;
  name: string;
  path: VFSPath;
  content: DocumentContent;
  metadata: DocumentMetadata;
  history: DocumentHistory;
}
```

---

## Next Steps

1. **Review this architecture** - Does it align with your vision?
2. **Prioritize phases** - Which capabilities are most important?
3. **Start with core** - Build State Machine and Command Bus first
4. **Incremental migration** - Move existing components into new structure
