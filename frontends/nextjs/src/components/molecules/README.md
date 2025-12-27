# Molecules

Molecules are simple groups of atoms that function together as a cohesive unit. Built on Material UI.

## Components

| Component | Description | Atoms Used |
|-----------|-------------|------------|
| `Card` | Container with header/content/footer | Box, Typography |
| `Dialog` | Modal dialog with transitions | MuiDialog |
| `Alert` | Feedback message with severity | MuiAlert |
| `Tabs` | Tab navigation | MuiTabs, MuiTab |
| `Accordion` | Collapsible sections | MuiAccordion |
| `Select` | Dropdown selection | MuiSelect |
| `DropdownMenu` | Context/action menu | Menu, MenuItem |
| `FormField` | Label + input + error | Label, Input |
| `SearchInput` | Input with search icon | TextField |
| `PasswordField` | Password input with visibility toggle | TextField, IconButton |
| `EmailField` | Email input with icon | TextField, InputAdornment |
| `NumberField` | Number input with constraints | TextField |
| `SearchBar` | Search input with clear and filter buttons | TextField, IconButton |
| `Popover` | Floating content panel | MuiPopover |

### Application Molecules
- `AppHeader` - Application header with logo and navigation
- `AppFooter` - Application footer with links
- `ProfileCard` - User profile display card
- `SecurityWarningDialog` - Security warning modal
- `PasswordChangeDialog` - Password change form modal

## Usage

```typescript
import { 
  Card, CardHeader, CardContent, 
  Dialog, Alert,
  PasswordField, EmailField, NumberField, SearchBar
} from '@/components/molecules'

function MyPage() {
  return (
    <Box>
      <Card>
        <CardHeader title="Title" description="Subtitle" />
        <CardContent>Content here</CardContent>
      </Card>

      <Alert variant="success" title="Success!">
        Operation completed.
      </Alert>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>Modal content</DialogContent>
      </Dialog>

      <PasswordField 
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <EmailField 
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        showIcon
      />

      <NumberField 
        label="Age"
        min={0}
        max={120}
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onClear={() => setSearchQuery('')}
        showFilterButton
        onFilterClick={handleOpenFilters}
      />
    </Box>
  )
}
```

## Rules

1. ✅ **DO** compose molecules from atoms
2. ✅ **DO** keep molecules focused on a single purpose
3. ✅ **DO** use MUI `sx` prop for styling
4. ✅ **DO** support both controlled and uncontrolled modes
5. ❌ **DON'T** import organisms
6. ❌ **DON'T** add complex business logic
7. ❌ **DON'T** use Tailwind classes (use MUI `sx` prop)

## Styling

```tsx
<Card sx={{ maxWidth: 400, mx: 'auto' }}>
  <CardHeader 
    title="User Profile"
    sx={{ bgcolor: 'primary.light' }}
  />
  <CardContent>
    <Typography>Content with theme colors</Typography>
  </CardContent>
</Card>
```

