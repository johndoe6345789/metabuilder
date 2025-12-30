# Organisms

Complex UI sections that combine atoms and molecules into complete features. Built on Material UI.

## Layout Components

| Component | Description |
|-----------|-------------|
| `Table` | Data table with header/body/footer |
| `Command` | Command palette (cmdk-style) |
| `Sheet` | Side panel drawer |
| `Sidebar` | Navigation sidebar with groups |
| `NavigationMenu` | Top navigation with dropdowns |
| `Form` | Form with react-hook-form integration |

## Feature Components

### Core Builders
- `SchemaEditor` - Full schema editing interface
- `ComponentCatalog` - Component browsing and selection
- `PropertyInspector` - Component property editor
- `Builder` - Visual page builder with drag-and-drop
- `Canvas` - Rendering canvas for visual builder

### Configuration Managers
- `CssClassBuilder` - Visual CSS class selection
- `ThemeEditor` - Theme customization interface
- `SMTPConfigEditor` - SMTP configuration form

### Code Editors
- `CodeEditor` - Monaco-based code editor
- `LuaEditor` - Lua script editor
- `JsonEditor` - JSON editing with validation
- `NerdModeIDE` - Full-featured IDE panel

### Data Management
- `DatabaseManager` - Database management
- `UserManagement` - User CRUD interface
- `PackageManager` - Package management
- `AuditLogViewer` - Audit log display

### Security Components
- `SecurityWarningDialog` - Security scan results dialog with severity classification

## Usage

```typescript
import { 
  Table, TableHeader, TableBody, TableRow, TableCell,
  Sidebar, SidebarHeader, SidebarContent,
  UserManagement 
} from '@/components/organisms'

function AdminPanel() {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar width={280}>
        <SidebarHeader>Admin</SidebarHeader>
        <SidebarContent>
          <SidebarGroup label="Users">
            <SidebarMenuItem icon={<PeopleIcon />}>Users</SidebarMenuItem>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <Box sx={{ flex: 1, p: 3 }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  )
}
```

## Rules

1. ✅ **DO** compose organisms from molecules and atoms
2. ✅ **DO** include business logic when needed
3. ✅ **DO** handle data fetching and state management
4. ✅ **DO** use MUI `sx` prop for styling
5. ❌ **DON'T** use Tailwind classes
6. ❌ **DON'T** create organisms that are too granular (use molecules)

## Testing

```typescript
describe('UserManagement', () => {
  it('allows creating new users', async () => {
    render(<UserManagement />)
    
    await userEvent.click(screen.getByRole('button', { name: /add user/i }))
    await userEvent.type(screen.getByLabelText(/username/i), 'newuser')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    
    expect(screen.getByText('newuser')).toBeInTheDocument()
  })
})
```
