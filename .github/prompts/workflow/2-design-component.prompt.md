# Design Component Architecture

Design a new component or feature following MetaBuilder patterns:

## Questions to Answer
1. Is this better as **declarative JSON** or **React TSX**?
   - Prefer declarative for data-driven UIs
   - Use TSX only for complex interactions

2. Can existing packages handle this?
   - Check `packages/*/seed/components.json`

3. What's the data flow?
   - Database → `Database` class → Component
   - Never bypass the Database wrapper

## Output a Design With
- Component tree structure
- Props interface
- Data dependencies
- Permission requirements
- Package location (new or existing)

## Size Constraints
- Components: < 150 LOC
- Split large components using composition
