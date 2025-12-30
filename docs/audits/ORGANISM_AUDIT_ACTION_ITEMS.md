# Organism Audit - Key Action Items

Based on the [Organism Composition Audit](ORGANISM_COMPOSITION_AUDIT.md), here are the prioritized action items:

## Immediate Actions (Complete)

- [x] Audit all organism files for composition patterns
- [x] Document findings in comprehensive audit report
- [x] Update `docs/todo/core/2-TODO.md` to mark audit as complete

## High Priority (Should address in Q1 2026)

### 1. Split Oversized Organisms

**Pagination.tsx (405 LOC)**
- Extract `SimplePagination` molecule
- Extract `PaginationInfo` molecule
- Extract `PerPageSelector` molecule

**Sidebar.tsx (399/309 LOC - 2 versions)**
- Extract `SidebarGroup` molecule
- Extract `SidebarMenuItem` molecule
- Extract `SidebarHeader` molecule
- Consolidate or document difference between two versions

**Navigation.tsx (370 LOC)**
- Extract `NavigationItem` molecule
- Extract `NavigationDropdown` molecule
- Extract `NavigationBrand` molecule

**Command.tsx (351/299 LOC - 2 versions)**
- Extract `CommandItem` molecule
- Extract `CommandGroup` molecule
- Extract `CommandEmpty` molecule
- Consolidate or document difference between two versions

## Medium Priority

### 2. Resolve Duplicate Components

Five organisms have duplicate implementations:
1. Command (52 LOC difference)
2. Form (66 LOC difference)
3. Sheet (65 LOC difference)
4. Sidebar (90 LOC difference)
5. Table (14 LOC difference)

**Action Required:**
- Review each pair to determine if both are needed
- Document the differences if both versions serve different purposes
- Consolidate if possible, or create one as a wrapper around the other

### 3. Extract Common Molecules

Create reusable molecules from common patterns:
- Form field wrappers (label + input + error)
- Navigation items with icons
- List items with selection states
- Modal/dialog headers and footers
- Search bars with filters

## Low Priority

### 4. Add Documentation

Enhance JSDoc comments for organisms:
- When to use each organism vs alternatives
- Composition patterns and best practices
- Code examples for common use cases

### 5. Establish Size Monitoring

Add CI/CD checks:
- Warn when organism files exceed 150 LOC
- Track component complexity metrics
- Monitor for circular dependencies

## Guidelines for Future Organisms

When creating new organisms:

1. **Start Small:** Keep initial implementation under 150 LOC
2. **Compose First:** Use existing molecules/atoms before creating new ones
3. **Single Responsibility:** Each organism should have one clear purpose
4. **Extract Early:** If a section grows complex, extract it to a molecule
5. **Document:** Add JSDoc with usage examples

## Success Criteria

An organism is well-structured when:
- ✅ Under 150 LOC (or split into multiple organisms)
- ✅ Composes from molecules/atoms (not raw MUI for business logic)
- ✅ Has clear single responsibility
- ✅ Is documented with JSDoc
- ✅ Has focused sub-components as molecules when possible

## Notes

- **MUI Direct Imports:** Acceptable for foundational UI organisms that wrap MUI components
- **Business Logic Organisms:** Should compose from UI organisms, not MUI directly
- **Atomic Design:** Remember the hierarchy: Atoms → Molecules → Organisms → Templates → Pages

---

See [ORGANISM_COMPOSITION_AUDIT.md](ORGANISM_COMPOSITION_AUDIT.md) for full details.
