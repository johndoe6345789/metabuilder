# JSON Constants Migration Guide

## Overview

This document tracks the extraction of hardcoded constants from JSON component definitions into the centralized constants folder.

## Status

### ✅ Constants Folder Created
Location: `src/lib/json-ui/constants/`

Files:
- `sizes.ts` - Size-related constants
- `placements.ts` - Positioning constants
- `styles.ts` - CSS class constants
- `object-fit.ts` - Image object-fit constants
- `index.ts` - Centralized exports

### 📋 Constants Found in JSON Files

#### CopyButton (`copy-button.json`)
```javascript
// Line 11: sizeStyles
const sizeStyles = { sm: 'p-1', md: 'p-2', lg: 'p-3' }
// → BUTTON_SIZES

// Lines 25, 39: iconSize (duplicated)
const iconSize = { sm: 12, md: 16, lg: 20 }
// → ICON_SIZES
```

#### Popover (`popover.json`)
```javascript
// Line 39: placementStyles
const placementStyles = {
  top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
  bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
  left: 'right-full mr-2 top-1/2 -translate-y-1/2',
  right: 'left-full ml-2 top-1/2 -translate-y-1/2'
}
// → POPOVER_PLACEMENTS
```

#### Image (`image.json`)
```javascript
// Line 51: Dynamic object-fit (uses template literal)
return `${base} ${opacity} object-${fit}`
// Could use OBJECT_FIT_CLASSES but requires transform refactor
```

## Recommendations

### Option 1: Keep Inline (Current Approach)
**Pros:**
- No changes to component-renderer needed
- Self-contained JSON definitions
- Easy to understand transforms

**Cons:**
- Duplication of constants
- Harder to maintain consistency
- Magic strings scattered across files

### Option 2: Import Constants in Hooks
**Pros:**
- Hooks can use TypeScript constants
- No changes to JSON structure needed
- Immediate benefit for custom hooks

**Cons:**
- Only helps with hook-based logic
- Still have duplication in JSON transforms

### Option 3: Add Constants to Transform Context (Future)
**Pros:**
- Eliminates duplication entirely
- Type-safe constants usage
- Easier to update global styles

**Cons:**
- Requires component-renderer changes
- More complex transform evaluation
- Migration effort for existing JSON files

## Recommended Next Steps

1. **Short term:** Use constants in custom hooks (Option 2)
   - Hooks can import from `@/lib/json-ui/constants`
   - Reduce duplication in hook code

2. **Medium term:** Document best practices
   - Add examples of using constants
   - Create migration guide for new components

3. **Long term:** Enhanced transform context (Option 3)
   - Update component-renderer to expose constants
   - Migrate existing JSON files to use constants
   - Remove inline const statements

## Files to Potentially Update

When migrating to Option 3:
- `copy-button.json` - sizeStyles, iconSize
- `popover.json` - placementStyles
- `menu.json` - May have similar patterns
- `file-upload.json` - May have size constants
- Any future components using similar patterns
