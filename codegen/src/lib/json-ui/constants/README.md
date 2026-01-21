# JSON UI Constants

This directory contains shared constants used across JSON component definitions.

## Available Constants

### Sizes (`sizes.ts`)
- `BUTTON_SIZES` - Button padding sizes: sm, md, lg
- `ICON_SIZES` - Icon pixel sizes: sm (12px), md (16px), lg (20px)
- `INPUT_HEIGHT` - Standard input height
- `MENU_WIDTH` - Standard menu width
- `POPOVER_WIDTH` - Standard popover width

### Placements (`placements.ts`)
- `POPOVER_PLACEMENTS` - Positioning classes for popovers/tooltips: top, bottom, left, right

### Styles (`styles.ts`)
- `TRANSITIONS` - Transition classes: colors, all, transform, opacity
- `ANIMATIONS` - Animation classes: fadeIn, slideIn, pulse
- `BORDER_STYLES` - Border classes: default, dashed, rounded, roundedMd
- `FOCUS_STYLES` - Focus ring classes: ring, destructive
- `DISABLED_STYLES` - Disabled state styling
- `HOVER_STYLES` - Hover state classes: accent, background, muted

### Object Fit (`object-fit.ts`)
- `OBJECT_FIT_CLASSES` - Image object-fit classes: cover, contain, fill, none, scale-down

## Usage in JSON Transforms

These constants are currently defined in TypeScript and can be imported into custom hooks or transform functions.

### Example: Current Usage (Inline)
```json
{
  "transform": "const sizeStyles = { sm: 'p-1', md: 'p-2', lg: 'p-3' }; return sizeStyles[data || 'md']"
}
```

### Example: Future Usage (With Constants)
Import constants in the component renderer or create a transform context that includes them:

```typescript
import { BUTTON_SIZES, ICON_SIZES } from '@/lib/json-ui/constants'

// In transform context:
{
  "transform": "BUTTON_SIZES[data || 'md']"
}
```

## Extracted Constants

The following constants have been identified in JSON files and extracted:

### CopyButton
- ✅ `sizeStyles` → `BUTTON_SIZES`
- ✅ `iconSize` → `ICON_SIZES`

### Popover
- ✅ `placementStyles` → `POPOVER_PLACEMENTS`

### Image
- Object-fit handling (dynamic with `object-${fit}`)

## Migration Notes

To use these constants in JSON transforms, the component-renderer would need to expose them in the transform evaluation context. This can be done by:

1. Importing constants into `component-renderer.tsx`
2. Adding them to the transform evaluation scope
3. Updating JSON definitions to reference constants directly

This refactoring would reduce duplication and improve maintainability.
