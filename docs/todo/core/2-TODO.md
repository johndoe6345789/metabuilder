# TODO 2 - Architecture and refactoring

> **See also**: [13-DECLARATIVE-UI-TODO.md](13-DECLARATIVE-UI-TODO.md), [14-MULTI-TENANT-TODO.md](14-MULTI-TENANT-TODO.md), [6-PACKAGES-TODO.md](6-PACKAGES-TODO.md)

## Atomic Design Refactoring

> Reference: `docs/reference/DOCUMENTATION_FINDINGS.md`, `docs/implementation/component-atomicity-refactor.md`

### Atoms (`src/components/atoms/`)
- [x] Audit existing atoms (~12 components) for proper isolation ✅ COMPLETED: 27 atoms audited, all properly isolated
- [x] Ensure atoms have no dependencies on molecules/organisms ✅ COMPLETED: ESLint rule added, see `docs/implementation/ui/atomic/ATOM_AUDIT_REPORT.md`
- [ ] Add missing base UI atoms (buttons, inputs, labels, icons)
- [ ] Document atom prop interfaces with JSDoc

### Molecules (`src/components/molecules/`)
- [x] Audit molecules (~10 components) - should be 2-5 atoms combined (✅ See `docs/implementation/ui/atomic/MOLECULE_AUDIT_REPORT.md`)
- [ ] Identify organisms incorrectly categorized as molecules
- [ ] Ensure molecules only import from atoms, not organisms
- [ ] Create missing common molecules (form fields, search bars, nav items)

### Organisms (`src/components/organisms/`)
- [ ] Audit organisms for proper composition of molecules/atoms
- [ ] Split oversized organisms (>150 LOC) into smaller organisms
- [ ] Document organism data flow and state management
- [ ] Ensure organisms handle layout, molecules handle interaction

### Templates & Pages
- [ ] Create page templates using organism composition
- [ ] Ensure pages only compose templates/organisms, minimal logic
- [ ] Add route-level code splitting for pages

## Component Refactoring

- [ ] Audit codebase for components over 150 LOC
- [ ] Split large components into smaller, declarative, generic renderers
- [ ] Convert hardcoded JSX to `RenderComponent` pattern

## Configuration Migration

- [ ] Identify hardcoded configuration in TypeScript/TSX
- [ ] Move configuration to JSON/Lua and database-driven storage

## Multi-Tenant Safety

- [ ] Review schema and data access paths for `tenantId` presence
- [ ] Ensure tenant filters are consistently applied to all queries

## Package Structure

- [ ] Verify packages follow standard structure (`seed/metadata.json`, `components.json`, `scripts/`, `index.ts`, `static_content/`)
- [ ] Add missing files to non-compliant packages

## Data Layer

- [ ] Use Prisma for standard CRUD, DBAL for server-only complex operations
- [ ] Confirm DBAL usage matches documentation

## Refactoring Process

- [ ] Follow phases: analysis → planning → implementation → testing → documentation
