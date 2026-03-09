# JSON Component Conversion Tasks

This task list captures the next steps for expanding JSON UI coverage, split between **component migrations** and **framework enablers**.

## Implementation Notes

- Component trees can live as JSON definitions.
- Custom behavior should be organized into hooks where appropriate.
- Types belong in `types` files; interfaces belong in dedicated `interfaces` files.
- Capture relevant conversion logs during work.

## Component Migration Tasks (Planned → Supported)

### Input Components
- [ ] **DatePicker**
  - Add `DatePicker` to `ComponentType` in `src/types/json-ui.ts`.
  - Register `DatePicker` in `src/lib/json-ui/component-registry.tsx`.
  - Add metadata/defaults to `src/lib/component-definitions.ts`.
  - Flip status to `supported` in `json-components-registry.json`.
- [ ] **FileUpload**
  - Add `FileUpload` to `ComponentType` in `src/types/json-ui.ts`.
  - Register `FileUpload` in `src/lib/json-ui/component-registry.tsx`.
  - Add metadata/defaults to `src/lib/component-definitions.ts`.
  - Flip status to `supported` in `json-components-registry.json`.

### Display Components
- [ ] **CircularProgress**
  - Add `CircularProgress` to `ComponentType` in `src/types/json-ui.ts`.
  - Register `CircularProgress` in `src/lib/json-ui/component-registry.tsx`.
  - Add metadata/defaults to `src/lib/component-definitions.ts`.
  - Flip status to `supported` in `json-components-registry.json`.
- [ ] **Divider**
  - Add `Divider` to `ComponentType` in `src/types/json-ui.ts`.
  - Register `Divider` in `src/lib/json-ui/component-registry.tsx`.
  - Add metadata/defaults to `src/lib/component-definitions.ts`.
  - Flip status to `supported` in `json-components-registry.json`.
- [ ] **ProgressBar**
  - Add `ProgressBar` to `ComponentType` in `src/types/json-ui.ts`.
  - Register `ProgressBar` in `src/lib/json-ui/component-registry.tsx`.
  - Add metadata/defaults to `src/lib/component-definitions.ts`.
  - Flip status to `supported` in `json-components-registry.json`.

### Navigation Components
- [ ] **Breadcrumb**
  - Decide whether JSON should map to `BreadcrumbNav` (atoms) or `Breadcrumb` (molecules).
  - Align props and bindings to a single JSON-friendly surface.
  - Register a single `Breadcrumb` entry and set status to `supported` in `json-components-registry.json`.

### Feedback Components
- [ ] **ErrorBadge**
  - Add `ErrorBadge` to `ComponentType` in `src/types/json-ui.ts`.
  - Register `ErrorBadge` in `src/lib/json-ui/component-registry.tsx`.
  - Add metadata/defaults to `src/lib/component-definitions.ts`.
  - Flip status to `supported` in `json-components-registry.json`.
- [ ] **Notification**
  - Add `Notification` to `ComponentType` in `src/types/json-ui.ts`.
  - Register `Notification` in `src/lib/json-ui/component-registry.tsx`.
  - Add metadata/defaults to `src/lib/component-definitions.ts`.
  - Flip status to `supported` in `json-components-registry.json`.
- [ ] **StatusIcon**
  - Add `StatusIcon` to `ComponentType` in `src/types/json-ui.ts`.
  - Register `StatusIcon` in `src/lib/json-ui/component-registry.tsx`.
  - Add metadata/defaults to `src/lib/component-definitions.ts`.
  - Flip status to `supported` in `json-components-registry.json`.

### Data Components
- [ ] **DataList**
  - Add `DataList` to `ComponentType` in `src/types/json-ui.ts`.
  - Register `DataList` in `src/lib/json-ui/component-registry.tsx`.
  - Add metadata/defaults to `src/lib/component-definitions.ts`.
  - Flip status to `supported` in `json-components-registry.json`.
- [ ] **DataTable**
  - Add `DataTable` to `ComponentType` in `src/types/json-ui.ts`.
  - Register `DataTable` in `src/lib/json-ui/component-registry.tsx`.
  - Add metadata/defaults to `src/lib/component-definitions.ts`.
  - Flip status to `supported` in `json-components-registry.json`.
- [ ] **MetricCard**
  - Add `MetricCard` to `ComponentType` in `src/types/json-ui.ts`.
  - Register `MetricCard` in `src/lib/json-ui/component-registry.tsx`.
  - Add metadata/defaults to `src/lib/component-definitions.ts`.
  - Flip status to `supported` in `json-components-registry.json`.
- [ ] **Timeline**
  - Add `Timeline` to `ComponentType` in `src/types/json-ui.ts`.
  - Register `Timeline` in `src/lib/json-ui/component-registry.tsx`.
  - Add metadata/defaults to `src/lib/component-definitions.ts`.
  - Flip status to `supported` in `json-components-registry.json`.

## Framework Enablers

- [ ] **Event binding extensions**
  - Expand event/action coverage to support richer interactions via JSON expressions.
  - Confirm compatibility with existing `expression` and `valueTemplate` handling.
- [ ] **State binding system**
  - Add support for stateful bindings needed by interactive components.
  - Document and enforce which components require state binding.
- [ ] **JSON-friendly wrappers**
  - Create wrapper components for hook-heavy/side-effect components.
  - Register wrappers in the JSON registry instead of direct usage.
- [ ] **Registry normalization**
  - Resolve duplicate component entries (e.g., multiple `Breadcrumb` variants) in `json-components-registry.json`.
- [ ] **Showcase schema coverage**
  - Add JSON schema examples for each newly supported component to keep demos current.
