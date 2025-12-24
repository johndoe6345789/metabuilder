# Organisms

Organisms are complex components that form distinct sections of an interface.

## What belongs here?

- **Complex composites** of molecules and atoms
- **Feature-complete sections** of the UI
- **Can contain business logic** and data fetching
- **Often specific to particular features**
- **Complete, functional units** of the interface

## Examples

### Core Builders
- `SchemaEditor` - Full schema editing interface with Monaco editor
- `ComponentCatalog` - Component browsing and selection system
- `PropertyInspector` - Complete component property editor
- `Builder` - Visual page builder with drag-and-drop
- `Canvas` - Rendering canvas for visual builder

### Configuration Managers
- `CssClassBuilder` - Visual CSS class selection system
- `CssClassManager` - CSS class library management panel
- `DropdownConfigManager` - Dropdown configuration interface
- `ThemeEditor` - Complete theme customization interface
- `SMTPConfigEditor` - SMTP configuration form

### Code Editors
- `CodeEditor` - Monaco-based code editor
- `LuaEditor` - Lua script editor with security scanning
- `JsonEditor` - JSON editing interface with validation
- `NerdModeIDE` - Full-featured IDE panel

### Data Management
- `DatabaseManager` - Database management and querying
- `UserManagement` - User CRUD interface
- `PackageManager` - Package browsing and installation
- `PackageImportExport` - Import/export functionality
- `AuditLogViewer` - Audit log display and filtering

### Feature Components
- `IRCWebchat` - Complete IRC chat interface
- `WorkflowEditor` - Workflow configuration system
- `PageRoutesManager` - Page routing management
- `ScreenshotAnalyzer` - Screenshot analysis tool
- `GitHubActionsFetcher` - GitHub actions integration

### Auth & Dialogs
- `UnifiedLogin` - Complete authentication interface
- `ComponentConfigDialog` - Component configuration modal

### Page Sections
- `HeroSection` - Hero section for landing page
- `FeaturesSection` - Features showcase section
- `ContactSection` - Contact form section
- `NavigationBar` - Main navigation bar
- `CommentsList` - Comments list with interactions

## Usage

```typescript
import { 
  SchemaEditor, 
  ComponentCatalog, 
  PropertyInspector,
  UserManagement 
} from '@/components/organisms'

function GodPanel() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <aside className="col-span-3">
        <ComponentCatalog />
      </aside>
      <main className="col-span-6">
        <SchemaEditor schema={currentSchema} />
      </main>
      <aside className="col-span-3">
        <PropertyInspector component={selectedComponent} />
      </aside>
    </div>
  )
}
```

## Rules

1. ✅ **DO** compose organisms from molecules and atoms
2. ✅ **DO** include business logic when needed
3. ✅ **DO** handle data fetching and state management
4. ✅ **DO** make organisms feature-complete
5. ✅ **DO** document complex organisms with JSDoc
6. ✅ **DO** split very large organisms into smaller ones
7. ❌ **DON'T** make organisms depend on page-specific context unnecessarily
8. ❌ **DON'T** create organisms that are too granular (use molecules)

## When to use Organisms vs Molecules

- If it's **2-5 simple elements**, it's a **molecule**
- If it's **a complex feature section**, it's an **organism**
- If it **contains business logic**, it's an **organism**
- If it **manages significant state**, it's an **organism**
- If it's **feature-specific**, it's an **organism**

## Organism Patterns

### Data Management
```typescript
export function UserManagement() {
  const [users, setUsers] = useKV('users', [])
  const [selectedUser, setSelectedUser] = useState(null)
  
  const handleAddUser = async (userData) => {
    // Complex business logic
  }
  
  return (
    <Card>
      <UserList users={users} onSelect={setSelectedUser} />
      <UserForm onSubmit={handleAddUser} />
    </Card>
  )
}
```

### Editor Pattern
```typescript
export function SchemaEditor({ schema }: SchemaEditorProps) {
  const [content, setContent] = useState(schema)
  const [errors, setErrors] = useState([])
  
  const handleValidate = () => {
    // Validation logic
  }
  
  const handleSave = async () => {
    // Save logic
  }
  
  return (
    <Dialog>
      <MonacoEditor 
        value={content} 
        onChange={setContent}
        onValidate={handleValidate}
      />
      <DialogFooter>
        <Button onClick={handleSave}>Save</Button>
      </DialogFooter>
    </Dialog>
  )
}
```

## Testing

Organisms should be tested with integration tests:

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

## Documentation

Complex organisms should include JSDoc comments:

```typescript
/**
 * SchemaEditor provides a complete interface for editing database schemas
 * with Monaco editor integration, validation, and security scanning.
 * 
 * @param schema - The schema object to edit
 * @param onSave - Callback when schema is saved
 * @param mode - Editor mode ('simple' | 'advanced')
 * 
 * @example
 * <SchemaEditor 
 *   schema={currentSchema}
 *   onSave={handleSave}
 *   mode="advanced"
 * />
 */
export function SchemaEditor({ schema, onSave, mode }: SchemaEditorProps) {
  // Implementation
}
```
