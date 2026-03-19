# Phase 9: Visual Workflow Canvas + Frontend Parity

**Status**: Complete
**Started**: 2026-03-19

---

## Part A: QML Workflow Canvas (PRIMARY)

Replace the list-based WorkflowEditor with a spatial infinite canvas.

### Steps

- [x] **Step 1: NodeRegistry C++ class** ✓
  - New `src/NodeRegistry.h` + `src/NodeRegistry.cpp`
  - Reads `workflow/plugins/registry/node-registry.json`
  - Exposes `nodeTypes()`, `groups()`, `nodeType(name)`, `nodesByGroup()`, `searchNodes()` to QML
  - Registered as context property `NodeRegistry` in `main.cpp`
  - Auto-discovered by `generate_cmake.py` (6 C++ sources total)

- [x] **Step 2: Canvas Infrastructure** ✓
  - `Flickable` 5000x5000 with grid background
  - `Scale` transform for zoom (0.25x–2x)
  - Mousewheel zoom, zoom overlay with +/- buttons
  - `Canvas` 2D connection layer + `Repeater` node layer

- [x] **Step 3: WorkflowNode Component** ✓
  - `qmllib/MetaBuilder/WorkflowNode.qml` with DragHandler
  - Colored header by group (prefix-based color mapping)
  - Input ports (left, blue), output ports (right, green)
  - Click-to-select with visual highlight
  - Inline node delegates in WorkflowEditor for tight integration

- [x] **Step 4: Bezier Connection Drawing** ✓
  - QML `Canvas` with `context.bezierCurveTo()`
  - Parses n8n-style `connections` adjacency map
  - Control points offset 40% of horizontal distance
  - Arrow heads at destination ports
  - Dashed line for connection being drawn
  - `requestPaint()` on node drag and connection changes

- [x] **Step 5: Node Palette (Left Sidebar)** ✓
  - ListView from `NodeRegistry.nodeTypes` filtered by search + group
  - Group filter chips (All, core, logic, transform, integration, etc.)
  - Double-click to add at canvas center
  - `Drag.active` + `DropArea` for drag-to-canvas

- [x] **Step 6: Properties Panel (Right Sidebar)** ✓
  - Animated slide-in panel (300px)
  - Name (editable), Type (badge with group color)
  - Parameters from `NodeRegistry.nodeType()` schema
  - Dynamic text fields and dropdowns for property options
  - Input/output port display with chips
  - Workflow variables display
  - Position readout, Delete button

- [x] **Step 7: Workflow I/O** ✓
  - Full n8n-style JSON: name, active, settings, tags, meta, variables, nodes, connections
  - DBAL load/save via `DBALProvider.list/create/update/remove`
  - Mock workflows with realistic graph layouts as fallback
  - Add/remove nodes + connections with proper cleanup

### Files

| File | Action |
|------|--------|
| `WorkflowEditor.qml` | Full rewrite — spatial canvas |
| `qmllib/MetaBuilder/WorkflowNode.qml` | New — draggable node component |
| `src/NodeRegistry.h` | New — C++ node type loader |
| `src/NodeRegistry.cpp` | New — implementation |
| `main.cpp` | Register NodeRegistry context property |
| `CMakeLists.txt` | Add NodeRegistry to sources |

### Verification

1. Build compiles clean
2. God Panel → Workflows tab shows canvas
3. Pan (scroll) + zoom (Ctrl+scroll) works
4. Load `seed_game.json` (58 nodes) renders correctly
5. Drag from palette → node on canvas
6. Port-to-port connection drawing
7. Properties panel for selected node
8. Save roundtrip to DBAL

---

## Part B: Next.js Frontend Alignment ✓

- [x] AppShell with 5-level auth gating (Guest → SuperGod)
- [x] Sidebar with static core items + dynamic DBAL package nav
- [x] God Panel with 10 tabs (schemas, workflows, packages, users, DB, etc.)
- [x] Super God Panel with multi-tenant control
- [x] JSON-driven config (sidebar-config.json, god-panel-config.json)
- [x] Workflow editor integration via WorkflowBuilder component

## Part C: CLI Feature Parity ✓

- [x] `workflow list/get/run/create/status` commands
- [x] `package list/install/uninstall/info/search` commands
- [x] Formatted table + JSON output, DBAL REST API backed

---

## Reusable Code

- `DBALProvider.qml` — DBAL REST client (keep as-is)
- `PackageLoader` C++ pattern — template for NodeRegistry
- `node-registry.json` — 152 node types
- `components/workflow-editor/ConnectionLine.tsx` — Bezier math reference
- `gameengine/packages/seed/workflows/*.json` — test data
