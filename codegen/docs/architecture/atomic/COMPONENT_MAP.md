# Component Dependency Map

This document visualizes how components are composed in the atomic structure.

## App Header Composition

```
AppHeader (organism)
├── NavigationMenu (organism)
│   ├── Sheet (shadcn)
│   ├── NavigationGroupHeader (molecule)
│   │   └── CaretDown icon
│   └── NavigationItem (molecule)
│       ├── Icon
│       ├── Label
│       └── Badge (shadcn)
├── AppBranding (molecule)
│   ├── AppLogo (atom)
│   │   └── Code icon
│   └── Title + Subtitle text
├── SaveIndicator (molecule)
│   ├── StatusIcon (atom)
│   │   ├── CheckCircle icon (saved)
│   │   └── CloudCheck icon (synced)
│   └── Time text
├── ProjectManager (feature)
└── ToolbarActions (organism)
    └── ToolbarButton (molecule) × 5
        ├── Button (shadcn)
        └── Tooltip (shadcn)
```

## Page Header Composition

```
PageHeader (organism)
└── PageHeaderContent (molecule)
    ├── TabIcon (atom)
    │   └── Icon with gradient wrapper
    ├── Title text
    └── Description text
```

## Navigation Menu Composition

```
NavigationMenu (organism)
├── Sheet (shadcn)
│   ├── SheetTrigger
│   │   └── Button with List icon
│   └── SheetContent
│       ├── SheetHeader with title
│       ├── Expand/Collapse buttons
│       └── ScrollArea (shadcn)
│           └── Collapsible (shadcn) × N groups
│               ├── NavigationGroupHeader (molecule)
│               │   ├── CaretDown icon
│               │   ├── Group label
│               │   └── Item count
│               └── CollapsibleContent
│                   └── NavigationItem (molecule) × N
│                       ├── Icon
│                       ├── Label
│                       └── Badge (optional)
```

## Feature Component Examples

### Dashboard Stats Grid
```
ProjectDashboard (feature)
└── Grid of StatCard (molecule) × N
    ├── IconWrapper (atom)
    │   └── Feature icon
    ├── Label text
    └── Value text
```

### Empty States
```
EmptyState (molecule)
├── EmptyStateIcon (atom)
│   └── Icon with gradient background
├── Title text
├── Description text
└── Action button (optional)
```

### Loading States
```
LoadingState (molecule)
├── LoadingSpinner (atom)
│   └── Animated spinner
└── Message text
```

## Component Import Graph

```
App.tsx
├── imports organisms
│   ├── AppHeader
│   │   ├── imports molecules
│   │   │   ├── AppBranding
│   │   │   ├── SaveIndicator
│   │   │   └── ToolbarButton
│   │   └── imports atoms
│   │       ├── AppLogo
│   │       ├── StatusIcon
│   │       └── ErrorBadge
│   ├── PageHeader
│   │   └── imports molecules
│   │       └── PageHeaderContent
│   │           └── imports atoms
│   │               └── TabIcon
│   └── NavigationMenu
│       ├── imports molecules
│       │   ├── NavigationGroupHeader
│       │   └── NavigationItem
│       └── imports config
│           └── navigation-config.tsx
└── imports features
    ├── CodeEditor
    ├── ModelDesigner
    ├── ProjectDashboard
    └── ... (more features)
```

## Atomic Levels Quick Reference

### Level 1: Atoms (7 components)
- `AppLogo` - Application logo icon
- `TabIcon` - Icon with styling variants
- `StatusIcon` - Status indicator (saved/synced)
- `ErrorBadge` - Badge showing error count
- `IconWrapper` - Styled icon wrapper
- `LoadingSpinner` - Animated loading spinner
- `EmptyStateIcon` - Large icon for empty states

### Level 2: Molecules (10 components)
- `SaveIndicator` - Shows save status with time
- `AppBranding` - Logo + app name + tagline
- `PageHeaderContent` - Page title with icon and description
- `ToolbarButton` - Button with tooltip
- `NavigationItem` - Navigation link with badge
- `NavigationGroupHeader` - Collapsible group header
- `EmptyState` - Empty state with icon, title, description
- `LoadingState` - Loading indicator with message
- `StatCard` - Statistic card with icon and value
- `LabelWithBadge` - Label with optional badge

### Level 3: Organisms (4 components)
- `NavigationMenu` - Complete navigation sidebar
- `PageHeader` - Page header with context
- `ToolbarActions` - Toolbar with multiple buttons
- `AppHeader` - Complete application header

### Level 4: Features (20+ components)
See `/components` directory for full list of feature components.

## Data Flow Example: Save Indicator

```
User makes change
    ↓
App.tsx updates KV store
    ↓
setLastSaved(Date.now())
    ↓
AppHeader receives lastSaved prop
    ↓
SaveIndicator (molecule) receives lastSaved
    ↓
Calculates isRecent = (now - lastSaved < 3s)
    ↓
Renders StatusIcon (atom) with type based on isRecent
    ↓
StatusIcon renders CheckCircle (recent) or CloudCheck (older)
```

## Styling Patterns

### Gradients
```css
/* Used in: AppLogo, TabIcon, EmptyStateIcon */
.gradient {
  @apply bg-gradient-to-br from-primary to-accent;
}

.gradient-muted {
  @apply bg-gradient-to-br from-muted to-muted/50;
}

.gradient-subtle {
  @apply bg-gradient-to-br from-primary/20 to-accent/20;
}
```

### Responsive Sizing
```css
/* Mobile-first approach used throughout */
.text-base sm:text-xl     /* Headings scale up on larger screens */
.w-8 sm:w-10              /* Icons grow on larger screens */
.gap-2 sm:gap-3           /* Spacing increases on larger screens */
.hidden sm:block          /* Show on larger screens only */
.hidden sm:flex           /* Show as flex on larger screens */
```

### Icon Sizes
```tsx
// Consistent icon sizing across components
<Icon size={14} />  // Badges, small UI elements
<Icon size={16} />  // Toolbar buttons, navigation items
<Icon size={18} />  // Standard buttons
<Icon size={20} />  // Logo, prominent buttons
<Icon size={24} />  // Page headers
```

## Testing Strategy

### Unit Tests (Atoms)
Test individual atoms in isolation:
```typescript
describe('StatusIcon', () => {
  it('renders CheckCircle when type is saved', () => {
    render(<StatusIcon type="saved" />)
    expect(screen.getByTestId('check-circle')).toBeInTheDocument()
  })
})
```

### Integration Tests (Molecules)
Test molecule composition:
```typescript
describe('SaveIndicator', () => {
  it('shows "Saved" text when recently saved', () => {
    const lastSaved = Date.now() - 1000
    render(<SaveIndicator lastSaved={lastSaved} />)
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })
})
```

### E2E Tests (Organisms)
Test complete user flows:
```typescript
describe('NavigationMenu', () => {
  it('navigates to code editor when item clicked', () => {
    render(<NavigationMenu {...props} />)
    userEvent.click(screen.getByText('Code Editor'))
    expect(onTabChange).toHaveBeenCalledWith('code')
  })
})
```

## Performance Considerations

### Memoization Strategy
```typescript
// Atoms: Usually pure, no memo needed
export function AppLogo() { ... }

// Molecules: Memo when props are complex
export const SaveIndicator = memo(({ lastSaved }) => { ... })

// Organisms: Always memo to prevent re-renders
export const NavigationMenu = memo(({ activeTab, ... }) => { ... })
```

### Code Splitting
```typescript
// Feature components are lazy-loaded
const CodeEditor = lazy(() => import('@/components/CodeEditor'))
const ModelDesigner = lazy(() => import('@/components/ModelDesigner'))

// Atoms and molecules are NOT lazy-loaded (too small, used everywhere)
```

## Accessibility Patterns

### Keyboard Navigation
```tsx
// All interactive elements support keyboard
<button 
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  aria-label="Descriptive label"
>
```

### Screen Reader Support
```tsx
// Icons have descriptive labels
<Icon aria-label="Loading" />

// Loading states announce
<div role="status" aria-live="polite">Loading...</div>

// Error badges announce count
<Badge aria-label={`${count} errors`}>{count}</Badge>
```

### Focus Management
```tsx
// Dialogs trap focus
<Dialog>...</Dialog>

// Navigation preserves focus
<Sheet>...</Sheet>

// Tooltips are keyboard accessible
<Tooltip>...</Tooltip>
```

## Future Enhancements

### Potential New Atoms
- `StatusDot` - Colored status indicator dot
- `AvatarInitials` - User initials in circle
- `KeyboardKey` - Styled keyboard key indicator

### Potential New Molecules
- `SearchInput` - Search input with icon and clear button
- `FileIcon` - File type icon with extension
- `Breadcrumbs` - Navigation breadcrumb trail
- `ActionMenu` - Dropdown menu with actions

### Potential New Organisms
- `CommandPalette` - Full command palette interface
- `QuickAccessToolbar` - Customizable quick actions
- `NotificationCenter` - Notification list and management
