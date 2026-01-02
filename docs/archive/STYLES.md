# Styles System

**Status:** ✅ Complete | **Schema:** V2 (Abstract System)

## Overview

Comprehensive styling system based on CSS as an abstract deterministic function, not syntax-focused format.

## What Exists

### Infrastructure ✅
- 44 packages with `seed/styles.json`
- All metadata.json files reference seed.styles
- Package validator with full V2 schema validation
- CSS Schema V2 specification

### Schema V2: Abstract System

**Core Abstraction:**
```
CSS = f(Style Rules, Element Tree, Environment) → Computed Styles
```

**10 Layers:**
1. **Identity** - Objects with ID, type, classes
2. **Selection** - Selectors as predicates
3. **Cascade** - Rules ordered by priority
4. **Values** - Typed properties (color, length, enum)
5. **Computed** - Resolved snapshots with source
6. **Layout** - Constraint systems (flex, grid)
7. **Paint** - Stacked effects
8. **Environment** - Context-dependent rules
9. **Tokens** - Design tokens as first-class values
10. **Animation** - State machines with keyframes

### Example (ui_home)

**V2 Schema includes:**
- 7 color tokens
- 5 selector predicates
- 4 effect definitions
- 9 appearance layers
- 2 layout systems
- 1 transition
- 4 cascade rules
- 3 responsive breakpoints

## GUI Mental Model

Users **define visual outcomes**, not write CSS:
1. Tag objects (identity)
2. Define conditions (selection)
3. Assign visual outcomes (effects/appearance)
4. Resolve conflicts (priority)
5. Preview result (computed)

**CSS is generated** as compilation output.

## Files

**Schema:**
- [CSS_SCHEMA_V2.md](../packages/shared/seed/CSS_SCHEMA_V2.md)
- [CSS_DATABASE_SCHEMA.md](../packages/shared/seed/CSS_DATABASE_SCHEMA.md)

**Validation:**
- [validate_styles.lua](../packages/package_validator/seed/scripts/validate_styles.lua)

**Example:**
- [ui_home/seed/styles.json](../packages/ui_home/seed/styles.json)

## Database Integration

```sql
CREATE TABLE styles (
  id VARCHAR(255) PRIMARY KEY,
  package_id VARCHAR(255),
  schema_version VARCHAR(10),
  data JSON,
  compiled_css TEXT,
  enabled BOOLEAN
);
```

## Next Steps

1. Implement V2 → CSS compiler
2. Build GUI designer (10 layer editors)
3. Create CSS → V2 migration tool
4. Database loader with hot reloading
