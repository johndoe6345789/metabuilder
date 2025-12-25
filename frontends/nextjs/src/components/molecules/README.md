# Molecules

Molecules are simple groups of atoms that function together as a cohesive unit.

## What belongs here?

- **Composites of 2-5 atoms** working together
- **Single, focused purpose**
- **Reusable across multiple contexts**
- **Can have internal state** but no complex business logic
- **Self-contained functionality**

## Examples

### Current Molecules
- `AppHeader` - Application header with logo and navigation
- `AppFooter` - Application footer with links
- `GodCredentialsBanner` - Alert displaying god credentials
- `ProfileCard` - User profile display card
- `SecurityWarningDialog` - Security warning modal
- `PasswordChangeDialog` - Password change form modal

### Good Molecule Examples
- **FormField** - Label + Input + Error message
- **SearchBar** - Input + Search icon + Clear button
- **CardHeader** - Avatar + Title + Subtitle
- **PaginationControls** - Previous + Page numbers + Next buttons
- **TabBar** - Multiple tab buttons working together
- **EmptyState** - Icon + Message + Action button
- **ConfirmDialog** - Dialog with title, message, and confirm/cancel buttons
- **AlertBanner** - Alert with icon, message, and close button

## Usage

```typescript
import { AppHeader, ProfileCard, SecurityWarningDialog } from '@/components/molecules'

function MyPage() {
  return (
    <div>
      <AppHeader />
      <ProfileCard user={currentUser} />
      <SecurityWarningDialog 
        open={showWarning} 
        onClose={() => setShowWarning(false)} 
      />
    </div>
  )
}
```

## Rules

1. ✅ **DO** compose molecules from atoms
2. ✅ **DO** keep molecules focused on a single purpose
3. ✅ **DO** make molecules reusable
4. ✅ **DO** use props for customization
5. ✅ **DO** document expected usage
6. ❌ **DON'T** import organisms
7. ❌ **DON'T** add complex business logic
8. ❌ **DON'T** make molecules too large (use organisms instead)
9. ❌ **DON'T** tightly couple to specific pages

## When to use Molecules vs Atoms

- If it's **one element**, it's an **atom**
- If it's **2-5 related elements**, it's a **molecule**
- If it's **a complex feature or section**, it's an **organism**

## Testing

Molecules should be easy to test in isolation:

```typescript
describe('ProfileCard', () => {
  it('displays user information', () => {
    render(<ProfileCard user={mockUser} />)
    expect(screen.getByText(mockUser.username)).toBeInTheDocument()
  })
})
```
