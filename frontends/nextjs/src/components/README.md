# MetaBuilder Component Architecture

This directory contains all React components for MetaBuilder, organized using **Atomic Design** principles.

## Quick Links

- 📖 [Full Atomic Design Guide](../../ATOMIC_DESIGN.md)
- 🗺️ [Complete Component Map](../../COMPONENT_MAP.md)
- 📊 [Visual Structure Diagram](../../ATOMIC_STRUCTURE.md)
- 🚀 [Quick Start Guide](../../ATOMIC_QUICKSTART.md)

## Directory Structure

```
components/
├── atoms/              → Basic UI elements (12+ from shadcn/ui)
├── molecules/          → Simple composites (6 components)
├── organisms/          → Complex features (40+ components)
├── ui/                 → shadcn components (unchanged)
├── shared/             → Shared utilities
├── level1/             → Level 1 page sections
├── level2/             → Level 2 page sections
├── level4/             → Level 4 page sections
├── level5/             → Level 5 page sections
└── [Level1-5].tsx     → Top-level page components
```

## Quick Import Reference

```typescript
// Atoms (basic UI elements)
import { Button, Input, Label, Badge } from '@/components/atoms'

// Molecules (simple composites)
import { AppHeader, ProfileCard } from '@/components/molecules'

// Organisms (complex features)
import { ComponentCatalog, SchemaEditor } from '@/components/organisms'

// Pages
import Level4 from '@/components/Level4'
```

## Component Categories

### 🔹 Atoms (Basic UI)
Small, indivisible UI elements:
- `Button`, `Input`, `Label`, `Badge`, `Avatar`
- `Separator`, `Skeleton`, `Switch`, `Slider`
- `Progress`, `Checkbox`, `RadioGroup`

**When to use:** Never create custom atoms unless shadcn doesn't provide it.

### 🔸 Molecules (Simple Composites)
Groups of 2-5 atoms with focused purpose:
- `AppHeader`, `AppFooter`
- `GodCredentialsBanner`, `ProfileCard`
- `SecurityWarningDialog`, `PasswordChangeDialog`

**When to use:** When combining 2-5 atoms for a reusable component.

### 🔶 Organisms (Complex Features)
Full-featured sections with business logic:

**Builders:** Builder, Canvas, ComponentCatalog, PropertyInspector

**Editors:** SchemaEditor, CodeEditor, JsonEditor, NerdModeIDE

`NerdModeIDE` is a thin wrapper that re-exports the modular implementation under `components/nerd-mode-ide/`.

**Managers:** DatabaseManager, UserManagement, PackageManager, ThemeEditor

**Features:** IRCWebchat, WorkflowEditor, AuditLogViewer, ScreenshotAnalyzer

**When to use:** For complex, feature-complete sections with state and logic.

### 📄 Pages (Complete Views)
Top-level page components:
- `Level1` - Public landing page
- `Level2` - User dashboard
- `Level3` - Admin panel
- `Level4` - God builder
- `Level5` - Super God panel

**When to use:** Only for complete page views.

## Rules

### ✅ Allowed Dependencies
- Atoms → React, external libraries only
- Molecules → Atoms
- Organisms → Atoms, Molecules, other Organisms
- Pages → Atoms, Molecules, Organisms

### ❌ Forbidden Dependencies
- Atoms ❌ Molecules, Organisms
- Molecules ❌ Organisms

## Creating New Components

### 1. Determine Category
Ask yourself:
- **Is it a single UI element?** → Use an existing Atom (shadcn)
- **Is it 2-5 atoms together?** → Create a Molecule
- **Is it a complex feature?** → Create an Organism
- **Is it a full page?** → Create a Page

### 2. Create the Component

**Example Molecule:**
```typescript
// src/components/molecules/StatusIndicator.tsx
import { Badge, Avatar } from '@/components/atoms'

export function StatusIndicator({ user, status }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <Avatar src={user.avatar} />
      <Badge>{status}</Badge>
    </div>
  )
}
```

**Example Organism:**
```typescript
// src/components/organisms/CommentSection.tsx
import { useState } from 'react'
import { useKV } from '@/hooks/data/useKV'
import { Button, Input } from '@/components/atoms'
import { ProfileCard } from '@/components/molecules'

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useKV(`comments-${postId}`, [])
  const [text, setText] = useState('')
  
  const addComment = () => {
    setComments(current => [...current, { text, timestamp: Date.now() }])
    setText('')
  }
  
  return (
    <div className="space-y-4">
      <Input value={text} onChange={(e) => setText(e.target.value)} />
      <Button onClick={addComment}>Add Comment</Button>
      {comments.map(comment => (
        <ProfileCard key={comment.timestamp} comment={comment} />
      ))}
    </div>
  )
}
```

### 3. Add to Index File
```typescript
// src/components/molecules/index.ts
export { StatusIndicator } from './StatusIndicator'

// src/components/organisms/index.ts
export { CommentSection } from './CommentSection'
```

### 4. Document if Complex
Add JSDoc comments for complex organisms:
```typescript
/**
 * CommentSection provides a full commenting system with real-time updates.
 * 
 * @param postId - The post to display comments for
 * @param allowReplies - Enable nested comment replies
 */
export function CommentSection({ postId, allowReplies }: Props) {
  // ...
}
```

## Benefits

### 🎯 For Developers
- **Clear hierarchy** - Know where to find components
- **Easy testing** - Test smaller pieces in isolation
- **Faster development** - Reuse existing atoms/molecules
- **Better maintainability** - Changes propagate naturally

### 🎨 For Designers
- **Consistent UI** - Shared atoms ensure visual consistency
- **Living design system** - Components serve as documentation
- **Easy prototyping** - Compose features from existing parts

### 📚 For Documentation
- **Self-documenting** - Structure explains complexity
- **Easy onboarding** - New developers understand quickly
- **Clear guidelines** - Know where new components belong

## Testing Strategy

### Unit Tests (Atoms & Molecules)
```typescript
test('ProfileCard displays user info', () => {
  render(<ProfileCard user={mockUser} />)
  expect(screen.getByText(mockUser.name)).toBeInTheDocument()
})
```

### Integration Tests (Organisms)
```typescript
test('CommentSection allows adding comments', async () => {
  render(<CommentSection postId="123" />)
  await userEvent.type(screen.getByRole('textbox'), 'Great post!')
  await userEvent.click(screen.getByText('Add Comment'))
  expect(screen.getByText('Great post!')).toBeInTheDocument()
})
```

### E2E Tests (Pages)
```typescript
test('Level2 user dashboard works', async () => {
  await page.goto('/level2')
  await page.click('text=Profile')
  expect(page.locator('.profile-card')).toBeVisible()
})
```

## Migration Notes

This structure is implemented using **virtual organization** via index.ts exports. 

- ✅ Existing imports continue to work
- ✅ New code can use atomic imports
- ✅ No breaking changes
- ✅ Gradual migration possible

### Old Way (still works)
```typescript
import { Button } from '@/components/ui/button'
import { ComponentCatalog } from '@/components/ComponentCatalog'
```

### New Way (recommended)
```typescript
import { Button } from '@/components/ui'
import { ComponentCatalog } from '@/components/organisms'
```

## Component Count

- **Atoms**: 12+ (all from shadcn/ui)
- **Molecules**: 6 components
- **Organisms**: 40+ components
- **Pages**: 5 components
- **Total**: 60+ components

## Common Patterns

### Pattern: Form Field
```typescript
// Molecule combining Label + Input + Error
import { Label, Input } from '@/components/atoms'

export function FormField({ label, error, ...props }: FormFieldProps) {
  return (
    <div>
      <Label>{label}</Label>
      <Input {...props} />
      {error && <span className="text-destructive">{error}</span>}
    </div>
  )
}
```

### Pattern: Data List
```typescript
// Organism handling data fetching and display
import { useKV } from '@/hooks/data/useKV'
import { Button } from '@/components/atoms'
import { Card } from '@/components/ui'

export function UserList() {
  const [users] = useKV('users', [])
  return (
    <Card>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </Card>
  )
}
```

### Pattern: Feature Section
```typescript
// Organism composing molecules and atoms
import { Button, Input } from '@/components/atoms'
import { ProfileCard } from '@/components/molecules'

export function UserProfile({ userId }: UserProfileProps) {
  // Complex business logic here
  return (
    <div>
      <ProfileCard user={user} />
      <Input />
      <Button>Save</Button>
    </div>
  )
}
```

## Need Help?

- **Finding components:** Check [COMPONENT_MAP.md](../../COMPONENT_MAP.md)
- **Understanding structure:** Read [ATOMIC_DESIGN.md](../../ATOMIC_DESIGN.md)
- **Getting started:** See [ATOMIC_QUICKSTART.md](../../ATOMIC_QUICKSTART.md)
- **Visual reference:** View [ATOMIC_STRUCTURE.md](../../ATOMIC_STRUCTURE.md)

## Resources

- [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [React Component Patterns](https://reactpatterns.com/)

---

**Remember:** Atoms → Molecules → Organisms → Pages

Build from the bottom up, compose from small to large! 🎨
