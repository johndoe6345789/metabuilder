# MetaBuilder Migration Status

**Goal:** Eliminate MUI dependencies, migrate to fakemui + Lua packages
**Status:** ✅ Phases 1-5 Complete | 📋 Phases 6-12 Planned

## Current State

| Component | Status |
|-----------|--------|
| @mui/material | ✅ **ELIMINATED** |
| @mui/icons-material | ✅ **ELIMINATED** |
| @phosphor-icons/react | ✅ **ELIMINATED** |
| @emotion/* | ✅ **ELIMINATED** |
| fakemui icons | ✅ 357+ icons |
| fakemui components | ✅ ~180 components |
| Lua packages | ✅ 43 typed & tested |
| Dependencies removed | ✅ 7 from package.json |

## Completed Work

### Phase 1-3: Foundation ✅
- 100+ TSX files migrated from @mui to fakemui
- Theme system converted to CSS custom properties
- 40+ SCSS modules created
- All source code MUI-free

### Phase 4: Icons ✅
- 357+ fakemui icons available
- All common MUI icons covered
- Icon naming conventions documented

### Phase 5: Validation ✅
- Fixed 14 packages with empty components.json
- All packages pass validation
- Added declarative component definitions

## Remaining Phases

### Phase 6: Permissions System
- Add database toggle to packages
- Component on/off switches
- minLevel enforcement in renderer

### Phase 7: CSS/Styles via Lua
- Create css_designer Lua package
- Style overlays via seed data
- Theme customization via database

### Phase 8: Legacy TSX → Lua
- Convert hardcoded TSX to Lua packages
- Wire components to Lua renderer

### Phase 9: Monaco/Markdown
- Monaco wrapper in fakemui
- Markdown renderer in fakemui

### Phase 10: Multi-Frontend
- Qt6/QML support
- CLI frontend integration
- Abstract rendering layer

### Phase 11-12: Cleanup & Verification
- Playwright E2E tests
- Final cleanup
- Documentation

## Quick Commands

```bash
# Test packages
npm run test:packages

# Validate packages
npm run validate:packages

# Check for MUI imports (should be none)
grep -r "@mui/material" frontends/nextjs/src --include="*.tsx"

# Build
npm run build
```

## Success Criteria

- [x] All packages pass validator
- [x] All packages have tests
- [x] Zero @mui/* imports
- [ ] Playwright E2E tests pass
- [ ] Bundle size reduced 15%+
