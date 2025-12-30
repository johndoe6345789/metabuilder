# Atomic Design Quick Start Guide

## Using Atomic Design in MetaBuilder

This guide shows you how to use the atomic design structure when building features.

## Basic Import Patterns

### Option 1: Import from atomic folders (recommended for new code)

```typescript
// Atoms - basic UI elements
import { Button, Input, Label, Badge, Avatar } from '@/components/atoms'

// Molecules - simple composites  
import { 
  AppHeader, 
  AppFooter,
  ProfileCard,
  SecurityWarningDialog 
} from '@/components/molecules'

// Organisms - complex features
import { 
  ComponentCatalog,
  PropertyInspector,
  SchemaEditor,
  UserManagement 
} from '@/components/organisms'

// Pages
import Level4 from '@/components/Level4'
```

### Option 2: Import directly (existing code continues to work)

```typescript
// Still works - no breaking changes
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/shared/AppHeader'
import { ComponentCatalog } from '@/components/ComponentCatalog'
```

## Real-World Examples

### Example 1: Building a Settings Panel (Organism)

```typescript
// src/components/organisms/SettingsPanel.tsx
import { useState } from 'react'
import { Button, Input, Label, Switch } from '@/components/atoms'
import { AppHeader } from '@/components/molecules'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

export function SettingsPanel() {
  const [notifications, setNotifications] = useState(true)
  const [email, setEmail] = useState('')
  
  const handleSave = () => {
    toast.success('Settings saved!')
  }
  
  return (
    <div className="space-y-6">
      <AppHeader />
      
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-bold">Settings</h2>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications">Enable Notifications</Label>
          <Switch 
            id="notifications"
            checked={notifications}
            onCheckedChange={setNotifications}
          />
        </div>
        
        <Button onClick={handleSave}>Save Settings</Button>
      </Card>
    </div>
  )
}
```

### Example 2: Creating a Status Badge (Molecule)

```typescript
// src/components/molecules/StatusBadge.tsx
import { Badge, Avatar } from '@/components/atoms'

interface StatusBadgeProps {
  user: { name: string; avatar: string }
  status: 'online' | 'offline' | 'away'
  showAvatar?: boolean
}

export function StatusBadge({ 
  user, 
  status, 
  showAvatar = true 
}: StatusBadgeProps) {
  const variants = {
    online: 'default',
    offline: 'secondary',
    away: 'outline'
  } as const
  
  return (
    <div className="flex items-center gap-2">
      {showAvatar && <Avatar src={user.avatar} alt={user.name} />}
      <Badge variant={variants[status]}>
        {status}
      </Badge>
    </div>
  )
}

// Usage in a page
import { StatusBadge } from '@/components/molecules'

function UserList() {
  return (
    <div>
      {users.map(user => (
        <StatusBadge 
          key={user.id} 
          user={user} 
          status={user.status} 
        />
      ))}
    </div>
  )
}
```

### Example 3: Building a Complex Form (Organism)

```typescript
// src/components/organisms/UserProfileForm.tsx
import { useState } from 'react'
import { useKV } from '@/hooks/data/useKV'
import { Button, Input, Label, Avatar } from '@/components/atoms'
import { ProfileCard } from '@/components/molecules'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'

interface UserProfileFormProps {
  userId: string
  onSave?: (data: UserData) => void
}

export function UserProfileForm({ userId, onSave }: UserProfileFormProps) {
  const [users, setUsers] = useKV('users', [])
  const user = users.find(u => u.id === userId)
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || ''
  })
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    setUsers(current => 
      current.map(u => u.id === userId ? { ...u, ...formData } : u)
    )
    
    toast.success('Profile updated!')
    onSave?.(formData)
  }
  
  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-semibold">Edit Profile</h2>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center mb-6">
            <ProfileCard user={user} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                name: e.target.value 
              }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                email: e.target.value 
              }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Input 
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                bio: e.target.value 
              }))}
            />
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex gap-2">
        <Button type="submit" onClick={handleSubmit}>
          Save Changes
        </Button>
        <Button variant="outline" onClick={() => setFormData({
          name: user?.name || '',
          email: user?.email || '',
          bio: user?.bio || ''
        })}>
          Reset
        </Button>
      </CardFooter>
    </Card>
  )
}
```

### Example 4: Composing a Page from Components

```typescript
// src/components/Level2.tsx
import { useState } from 'react'
import { Button } from '@/components/atoms'
import { AppHeader, AppFooter, ProfileCard } from '@/components/molecules'
import { 
  UserProfileForm,
  IRCWebchat,
  CommentsList 
} from '@/components/organisms'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Level2Props {
  user: User
  onLogout: () => void
  onNavigate: (level: number) => void
}

export function Level2({ user, onLogout, onNavigate }: Level2Props) {
  const [activeTab, setActiveTab] = useState('profile')
  
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      
      <main className="flex-1 container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">User Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.username}!</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <UserProfileForm userId={user.id} />
          </TabsContent>
          
          <TabsContent value="chat">
            <IRCWebchat user={user} />
          </TabsContent>
          
          <TabsContent value="comments">
            <CommentsList userId={user.id} />
          </TabsContent>
        </Tabs>
      </main>
      
      <AppFooter />
    </div>
  )
}

export default Level2
```

## Decision Tree: Which Category?

### Is it a single UI element?
**→ Use an ATOM (from shadcn/ui)**
- Examples: Button, Input, Badge, Avatar
- Import from: `@/components/atoms` or `@/components/ui/*`

### Is it 2-5 atoms working together?
**→ Create a MOLECULE**
- Examples: FormField, SearchBar, CardHeader
- Put in: `src/components/molecules/`
- Export from: `@/components/molecules/index.ts`

### Is it a complex feature with business logic?
**→ Create an ORGANISM**
- Examples: UserManagement, SchemaEditor, Chat
- Put in: `src/components/organisms/`
- Export from: `@/components/organisms/index.ts`

### Is it a complete page/view?
**→ It's a PAGE**
- Examples: Level1, Level2, Level3
- Keep at: `src/components/`

## Best Practices

### 1. Keep Atoms Generic
```typescript
// ✅ Good - generic and reusable
export function StatusBadge({ status }: { status: string }) {
  return <Badge>{status}</Badge>
}

// ❌ Bad - too specific
export function UserOnlineStatusBadgeForLevel2Dashboard({ status }: Props) {
  return <Badge>{status}</Badge>
}
```

### 2. Molecules Should Be Self-Contained
```typescript
// ✅ Good - everything needed is inside
export function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')
  
  return (
    <div className="flex gap-2">
      <Input value={query} onChange={(e) => setQuery(e.target.value)} />
      <Button onClick={() => onSearch(query)}>Search</Button>
    </div>
  )
}

// ❌ Bad - state managed externally
export function SearchBar({ query, setQuery, onSearch }: Props) {
  return (
    <div className="flex gap-2">
      <Input value={query} onChange={(e) => setQuery(e.target.value)} />
      <Button onClick={onSearch}>Search</Button>
    </div>
  )
}
```

### 3. Organisms Can Have Complex Logic
```typescript
// ✅ Good - organism handles complex state and business logic
export function UserManagement() {
  const [users, setUsers] = useKV('users', [])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('')
  
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(filter.toLowerCase())
  )
  
  const handleAddUser = async (userData: UserData) => {
    setLoading(true)
    // Complex user creation logic
    await Database.addUser(userData)
    setUsers(current => [...current, newUser])
    setLoading(false)
  }
  
  return (
    <Card>
      <SearchBar onSearch={setFilter} />
      <UserList users={filteredUsers} />
      <UserForm onSubmit={handleAddUser} loading={loading} />
    </Card>
  )
}
```

### 4. Use Composition
```typescript
// ✅ Good - compose from smaller parts
function SettingsPage() {
  return (
    <div>
      <AppHeader />
      <ThemeEditor />
      <SMTPConfigEditor />
      <AppFooter />
    </div>
  )
}

// ❌ Bad - monolithic component
function SettingsPage() {
  // 500 lines of code doing everything
}
```

## Testing by Atomic Level

### Testing Atoms (from shadcn)
```typescript
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/atoms'

test('Button renders text', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByText('Click me')).toBeInTheDocument()
})
```

### Testing Molecules
```typescript
import { render, screen } from '@testing-library/react'
import { ProfileCard } from '@/components/molecules'

test('ProfileCard displays user information', () => {
  const user = { name: 'John Doe', email: 'john@example.com' }
  render(<ProfileCard user={user} />)
  
  expect(screen.getByText('John Doe')).toBeInTheDocument()
  expect(screen.getByText('john@example.com')).toBeInTheDocument()
})
```

### Testing Organisms
```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserManagement } from '@/components/organisms'

test('UserManagement allows creating users', async () => {
  render(<UserManagement />)
  
  await userEvent.click(screen.getByRole('button', { name: /add user/i }))
  await userEvent.type(screen.getByLabelText(/name/i), 'Jane Doe')
  await userEvent.click(screen.getByRole('button', { name: /save/i }))
  
  await waitFor(() => {
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })
})
```

## Common Patterns

### Pattern 1: Form Field (Molecule)
```typescript
import { Input, Label } from '@/components/atoms'

export function FormField({ 
  label, 
  id, 
  error, 
  ...props 
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
```

### Pattern 2: Data Table (Organism)
```typescript
import { Button, Input } from '@/components/atoms'
import { Table } from '@/components/ui/table'
import { useState } from 'react'

export function UserTable({ data }: { data: User[] }) {
  const [filter, setFilter] = useState('')
  const [sortBy, setSortBy] = useState('name')
  
  const filteredData = data
    .filter(row => row.name.includes(filter))
    .sort((a, b) => a[sortBy].localeCompare(b[sortBy]))
  
  return (
    <div className="space-y-4">
      <Input 
        placeholder="Filter..." 
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <Table>
        {/* Table implementation */}
      </Table>
    </div>
  )
}
```

## Questions?

- **Where do I put a component?** Use the decision tree above
- **Can atoms import molecules?** No, never
- **Can organisms import other organisms?** Yes, that's fine
- **Do I have to move existing components?** No, exports make it virtual
- **Should I refactor everything now?** No, use atomic design for new code

## Summary

- **Atoms**: Basic UI elements (shadcn/ui)
- **Molecules**: 2-5 atoms working together  
- **Organisms**: Complex features with logic
- **Pages**: Complete views

Import from `@/components/atoms`, `@/components/molecules`, or `@/components/organisms` for cleaner code!
