# Fakemui Icon System

**Status:** Active Development
**Philosophy:** Zero dependencies, add icons as needed
**Source:** Copy from Heroicons, Lucide, Phosphor as required

---

## Quick Start

```tsx
import { Plus, Trash, Copy } from '@/fakemui'

function MyComponent() {
  return (
    <button>
      <Plus size={20} weight="bold" />
      Add Item
    </button>
  )
}
```

---

## Available Icons

This section highlights core, commonly used icons. For the complete set, refer to `fakemui/icons/index.ts`.

Current icon count: **310 icons** (see `fakemui/icons/index.ts` for the full list)

### Actions (5)
- `Plus` - Add, create, new
- `Trash` - Delete, remove
- `Copy` - Duplicate, copy
- `Check` - Confirm, success, done
- `X` - Close, cancel, dismiss

### Navigation (7)
- `ArrowUp` - Move up, scroll up
- `ArrowDown` - Move down, scroll down
- `ArrowClockwise` - Refresh, reload, retry
- `ChevronUp` - Expand up, collapse
- `ChevronDown` - Expand down, show more
- `ChevronLeft` - Previous, back
- `ChevronRight` - Next, forward

### Files & UI (8)
- `FloppyDisk` - Save, export
- `Search` - Find, filter
- `Settings` - Configure, preferences
- `User` - Profile, account
- `Menu` - Hamburger menu, navigation
- `Eye` - View, show, visible
- `EyeSlash` - Hide, hidden, password
- `Pencil` - Edit, modify

### Communication & Time (4)
- `Calendar` - Date, schedule, events
- `Clock` - Time, duration
- `Mail` - Email, message, contact
- `Bell` - Notifications, alerts

### Social (3)
- `Star` - Favorite, bookmark, featured
- `Heart` - Like, love, favorite
- `Share` - Share, export, send

---

## Icon Props

All icons support the following props:

```tsx
interface IconProps extends React.SVGAttributes<SVGElement> {
  size?: number | string        // Default: 24
  weight?: 'thin' | 'light' | 'regular' | 'bold'  // Default: 'regular'
  // Plus all standard SVG attributes (className, onClick, etc.)
}
```

### Examples

```tsx
// Size variants
<Plus size={16} />      // Small
<Plus size={24} />      // Default
<Plus size={32} />      // Large

// Weight variants
<Plus weight="thin" />     // strokeWidth: 1
<Plus weight="light" />    // strokeWidth: 1.5
<Plus weight="regular" />  // strokeWidth: 2 (default)
<Plus weight="bold" />     // strokeWidth: 2.5

// Custom styling
<Plus className="text-blue-500" />
<Plus style={{ color: 'red' }} />
<Plus onClick={() => console.log('clicked')} />
```

---

## Adding New Icons

### Step 1: Find the SVG

**Recommended Sources:**
- [Heroicons](https://heroicons.com/) - Tailwind's icon set
- [Lucide](https://lucide.dev/) - Beautiful, consistent icons
- [Phosphor Icons](https://phosphoricons.com/) - Flexible icon family

### Step 2: Create the Component

Create a new file in `fakemui/icons/IconName.tsx`:

```tsx
import React from 'react'
import { Icon, IconProps } from './Icon'

export const IconName = (props: IconProps) => (
  <Icon {...props}>
    {/* Paste SVG paths here */}
    <path d="..." />
    <line x1="..." y1="..." x2="..." y2="..." />
  </Icon>
)
```

**Important:**
- Use viewBox="0 0 256 256" coordinate system (Phosphor standard)
- Icons should be stroke-based, not fill-based
- Remove any fill/stroke attributes from paths (Icon component handles this)

### Step 3: Export from index.ts

Add to `fakemui/icons/index.ts`:

```ts
export { IconName } from './IconName'
```

### Step 4: Export from main barrel

Add to `fakemui/index.ts`:

```ts
// Icons
export {
  Icon,
  Plus,
  Trash,
  Copy,
  // ... existing icons
  IconName,  // Add your new icon
} from './icons'
```

### Step 5: Update this README

Add your icon to the "Available Icons" section above.

---

## Icon Conversion Guide

### From Phosphor Icons

Phosphor uses `viewBox="0 0 256 256"` - perfect for our system!

```tsx
// Source: https://phosphoricons.com/
<svg viewBox="0 0 256 256">
  <line x1="40" y1="128" x2="216" y2="128" />
  <line x1="128" y1="40" x2="128" y2="216" />
</svg>

// fakemui component:
export const Plus = (props: IconProps) => (
  <Icon {...props}>
    <line x1="40" y1="128" x2="216" y2="128" />
    <line x1="128" y1="40" x2="128" y2="216" />
  </Icon>
)
```

### From Heroicons

Heroicons uses `viewBox="0 0 24 24"` - needs scaling!

```tsx
// Source: https://heroicons.com/
<svg viewBox="0 0 24 24">
  <path d="M12 4.5v15m7.5-7.5h-15" />
</svg>

// Scale by 10.67 (256/24):
export const Plus = (props: IconProps) => (
  <Icon {...props}>
    <path d="M128 48v160m80-80h-160" />
  </Icon>
)
```

### From Lucide

Lucide uses `viewBox="0 0 24 24"` - same scaling as Heroicons.

```tsx
// Source: https://lucide.dev/
<svg viewBox="0 0 24 24">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>

// Scale coordinates:
export const Plus = (props: IconProps) => (
  <Icon {...props}>
    <path d="M53 128h149" />
    <path d="M128 53v149" />
  </Icon>
)
```

---

## Icon Naming Conventions

- **PascalCase** for component names: `ArrowUp`, `CheckCircle`, `UserPlus`
- **Descriptive** names: prefer `Trash` over `Delete`, `Copy` over `Duplicate`
- **Consistent** with existing patterns: `ArrowUp/Down/Left/Right`
- **Action-oriented**: `Plus` (not `Add`), `Trash` (not `Remove`)

---

## Migration Progress

### Phase 1: Core Actions (7/7) ✅
- [x] Plus
- [x] Trash
- [x] Copy
- [x] ArrowUp
- [x] ArrowDown
- [x] ArrowClockwise
- [x] FloppyDisk

### Phase 2: Common Icons (20/20) ✅
- [x] Check
- [x] X (Close)
- [x] ChevronUp/Down/Left/Right (4 icons)
- [x] Search
- [x] Settings
- [x] User
- [x] Menu
- [x] Eye/EyeSlash
- [x] Edit (Pencil)
- [x] Calendar
- [x] Clock
- [x] Mail
- [x] Bell
- [x] Star
- [x] Heart
- [x] Share

### Phase 3: Specialized Icons (0/30+) ⏳
Add as needed based on component migration

---

## Icon Size Guidelines

| Size | Use Case | Example |
|------|----------|---------|
| 12px | Tiny badges, indicators | Status dots |
| 16px | Small UI elements | Inline icons, table cells |
| 20px | Default UI | Buttons, inputs, cards |
| 24px | Standard size | Menu items, toolbars |
| 32px | Large UI | Headers, hero sections |
| 48px+ | Feature icons | Landing pages, empty states |

---

## Performance Notes

- Each icon is ~1KB gzipped
- Tree-shakeable (only bundle icons you use)
- No runtime dependencies
- SSR-friendly
- TypeScript definitions included

---

## Comparison to Icon Libraries

| Library | Size (full) | Size (10 icons) | Dependencies |
|---------|-------------|-----------------|--------------|
| **fakemui** | ~10KB | ~10KB | Zero |
| Phosphor Icons | 500KB | ~50KB | React |
| Lucide React | 300KB | ~30KB | React |
| Heroicons | 200KB | ~20KB | React |
| MUI Icons | 1MB+ | ~100KB | MUI, Emotion |

**Winner:** fakemui - smallest bundle, zero deps, full control

---

## Future Enhancements

- [ ] Animated icon variants (spin, pulse, etc.)
- [ ] Icon sprite system for even better performance
- [ ] Auto-generate icons from Figma
- [ ] Visual icon gallery/documentation
- [ ] Dark mode variants (if needed)

---

**Last Updated:** 2025-12-30
**Maintainer:** Metabuilder Team
