# Component Classification Map

This document provides a complete mapping of all components in MetaBuilder organized by atomic design principles.

## Directory Structure

```
src/components/
├── atoms/                    # Basic UI elements (shadcn/ui exports)
│   ├── index.ts             # Re-exports shadcn components
│   └── README.md
├── molecules/               # Simple composite components
│   ├── index.ts
│   ├── README.md
│   ├── AppHeader.tsx        → from shared/
│   ├── AppFooter.tsx        → from shared/
│   ├── GodCredentialsBanner.tsx → from level1/
│   ├── ProfileCard.tsx      → from level2/
│   ├── SecurityWarningDialog.tsx
│   └── PasswordChangeDialog.tsx
├── organisms/               # Complex feature components
│   ├── index.ts
│   ├── README.md
│   └── [all complex components - see below]
├── ui/                      # shadcn components (unchanged)
├── shared/                  # Shared utilities (keep existing)
├── level1/                  # Level 1 page components
├── level2/                  # Level 2 page components
├── level4/                  # Level 4 page components
├── level5/                  # Level 5 page components
└── [Level components]       # Top-level page components
```

## Atoms (Basic UI Elements)

All atoms are from `shadcn/ui` and re-exported via `@/components/atoms`:

| Component | Source | Purpose |
|-----------|--------|---------|
| Button | shadcn/ui | Clickable button element |
| Input | shadcn/ui | Text input field |
| Label | shadcn/ui | Form label |
| Badge | shadcn/ui | Status/tag indicator |
| Avatar | shadcn/ui | User avatar image |
| Separator | shadcn/ui | Visual divider |
| Skeleton | shadcn/ui | Loading placeholder |
| Switch | shadcn/ui | Toggle switch |
| Slider | shadcn/ui | Range slider |
| Progress | shadcn/ui | Progress bar |
| Checkbox | shadcn/ui | Checkbox input |
| RadioGroup | shadcn/ui | Radio buttons |

**Note:** All other shadcn components (Card, Dialog, Tabs, Select, etc.) should be imported directly from `@/components/ui/*` as needed.

## Molecules (Simple Composites)

| Component | Current Location | Complexity | Description |
|-----------|------------------|------------|-------------|
| AppHeader | shared/ | Low | Header with logo and navigation |
| AppFooter | shared/ | Low | Footer with links |
| GodCredentialsBanner | level1/ | Low | Alert banner for credentials |
| ProfileCard | level2/ | Low | User profile card display |
| SecurityWarningDialog | root | Medium | Security warning modal |
| PasswordChangeDialog | root | Medium | Password change form |

## Organisms (Complex Features)

### Core Builders
| Component | Current Location | Purpose |
|-----------|------------------|---------|
| Builder | root | Visual page builder system |
| Canvas | root | Rendering canvas for builder |
| ComponentCatalog | root | Component selection interface |
| ComponentConfigDialog | root | Component configuration modal |
| ComponentHierarchyEditor | root | Component tree editor |
| PropertyInspector | root | Property editing panel |

### Schema & Data Management
| Component | Current Location | Purpose |
|-----------|------------------|---------|
| SchemaEditor | root | Schema editing with Monaco |
| SchemaEditorLevel4 | root | Level 4 schema editor variant |
| DatabaseManager | root | Database operations panel |
| FieldRenderer | root | Dynamic field renderer |
| RecordForm | root | Record CRUD form |
| ModelListView | root | Model list display |

### Code Editors
| Component | Current Location | Purpose |
|-----------|------------------|---------|
| CodeEditor | root | Monaco-based code editor |
| JsonEditor | root | JSON editing interface |
| LuaEditor | root | Lua script editor |
| LuaSnippetLibrary | root | Lua snippet management |
| NerdModeIDE | root | Full IDE panel |

### Configuration Managers
| Component | Current Location | Purpose |
|-----------|------------------|---------|
| CssClassBuilder | root | Visual CSS selector |
| CssClassManager | root | CSS class library manager |
| DropdownConfigManager | root | Dropdown configuration |
| ThemeEditor | root | Theme customization |
| SMTPConfigEditor | root | SMTP settings form |
| GodCredentialsSettings | root | God credentials manager |
| PageRoutesManager | root | Page routing config |

### Package System
| Component | Current Location | Purpose |
|-----------|------------------|---------|
| PackageManager | root | Package browsing/install |
| PackageImportExport | root | Import/export packages |

### User & Auth
| Component | Current Location | Purpose |
|-----------|------------------|---------|
| UserManagement | root | User CRUD interface |
| UnifiedLogin | root | Unified authentication |
| Login | root | Login form |

### Features & Tools
| Component | Current Location | Purpose |
|-----------|------------------|---------|
| IRCWebchat | root | IRC chat interface |
| IRCWebchatDeclarative | root | Declarative IRC chat |
| WorkflowEditor | root | Workflow configuration |
| AuditLogViewer | root | Audit log display |
| ScreenshotAnalyzer | root | Screenshot analysis |
| GitHubActionsFetcher | root | GitHub actions integration |

### Page Components
| Component | Current Location | Purpose |
|-----------|------------------|---------|
| GenericPage | root | Generic page renderer |
| RenderComponent | root | Dynamic component renderer |
| QuickGuide | root | Feature guide/docs |

### Level Sections
| Component | Current Location | Purpose |
|-----------|------------------|---------|
| HeroSection | level1/ | Landing hero section |
| FeaturesSection | level1/ | Features showcase |
| ContactSection | level1/ | Contact form |
| NavigationBar | level1/ | Main navigation |
| CommentsList | level2/ | Comments list |

## Pages (Top-Level)

These remain at component root level:

| Component | Purpose |
|-----------|---------|
| Level1 | Public landing page |
| Level2 | User dashboard |
| Level3 | Admin panel |
| Level4 | God-tier builder |
| Level5 | Super God panel |

## Import Path Changes

### Before (current)
```typescript
import { ComponentCatalog } from '@/components/ComponentCatalog'
import { PropertyInspector } from '@/components/PropertyInspector'
import { AppHeader } from '@/components/shared/AppHeader'
```

### After (with atomic structure)
```typescript
// Atoms (shadcn components)
import { Button, Input, Label } from '@/components/atoms'

// Molecules
import { 
  AppHeader, 
  ProfileCard, 
  SecurityWarningDialog 
} from '@/components/molecules'

// Organisms
import { 
  ComponentCatalog, 
  PropertyInspector,
  SchemaEditor 
} from '@/components/organisms'

// Pages (unchanged)
import Level1 from '@/components/Level1'
```

## Benefits of This Structure

1. **Clear Hierarchy** - Instantly understand component complexity
2. **Better Reusability** - Atoms and molecules are highly reusable
3. **Easier Testing** - Test atoms/molecules in isolation
4. **Improved Onboarding** - New developers understand architecture quickly
5. **Maintainability** - Changes to atoms propagate naturally
6. **Documentation** - Structure serves as living documentation
7. **Scalability** - Easy to add new components in right place

## Migration Status

- [x] Create folder structure
- [x] Create index files with exports
- [x] Create README documentation
- [ ] Move molecules to new folder (optional - can use exports)
- [ ] Update import paths throughout codebase
- [ ] Update tests
- [ ] Verify build

**Note:** The current implementation uses **virtual organization** via index.ts exports. Components can physically stay where they are, but are logically organized through the index files. This avoids breaking existing imports while providing clear atomic structure.

## Usage Examples

### Building a Feature with Atomic Design

```typescript
// Use atoms for basic elements
import { Button, Input, Label, Badge } from '@/components/atoms'

// Use molecules for simple composites
import { ProfileCard, AppHeader } from '@/components/molecules'

// Use organisms for complex features
import { 
  UserManagement, 
  SchemaEditor 
} from '@/components/organisms'

function MyFeature() {
  return (
    <div>
      <AppHeader />
      <UserManagement />
      <ProfileCard user={currentUser} />
    </div>
  )
}
```

### Creating New Components

**New Atom (rare):**
Only if shadcn doesn't provide it.
```typescript
// src/components/atoms/CustomIcon.tsx
export function CustomIcon({ name }: CustomIconProps) {
  return <svg>...</svg>
}
```

**New Molecule:**
Combination of 2-5 atoms.
```typescript
// src/components/molecules/StatusBadge.tsx
import { Badge, Avatar } from '@/components/atoms'

export function StatusBadge({ user, status }: StatusBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <Avatar src={user.avatar} />
      <Badge variant={status}>{status}</Badge>
    </div>
  )
}
```

**New Organism:**
Complex feature with business logic.
```typescript
// src/components/organisms/AdvancedSearch.tsx
import { Button, Input } from '@/components/atoms'
import { SearchBar } from '@/components/molecules'
import { useKV } from '@github/spark/hooks'

export function AdvancedSearch() {
  const [history, setHistory] = useKV('search-history', [])
  // Complex search logic...
  return (...)
}
```

## Testing Strategy

### Atoms
Test in isolation with simple props:
```typescript
test('Button renders correctly', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByText('Click me')).toBeInTheDocument()
})
```

### Molecules
Test composition and interaction:
```typescript
test('ProfileCard displays user info', () => {
  const user = { name: 'John', email: 'john@example.com' }
  render(<ProfileCard user={user} />)
  expect(screen.getByText('John')).toBeInTheDocument()
})
```

### Organisms
Test integration and business logic:
```typescript
test('UserManagement creates new user', async () => {
  render(<UserManagement />)
  await userEvent.click(screen.getByText('Add User'))
  // ... complex interaction tests
})
```

## Future Considerations

1. **Physical Migration:** If codebase grows significantly, physically move components to atomic folders
2. **Storybook:** Add Storybook for visual component documentation
3. **Component Library:** Extract atoms/molecules to separate package
4. **Design System:** Formalize design tokens and component variants
5. **Auto-generation:** Generate component documentation from TypeScript types
