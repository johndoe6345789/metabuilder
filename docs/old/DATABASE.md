# Database Architecture

## Overview

MetaBuilder uses a comprehensive database abstraction layer built on top of the Spark KV persistence API. All data is stored persistently across sessions with proper security measures including SHA-512 password hashing.

## Database Entities

The database manages the following entity types:

### Core Entities

#### Users
- **Key**: `db_users`
- **Type**: `User[]`
- **Description**: All registered users in the system
- **Fields**:
  - `id`: Unique identifier
  - `username`: Login username
  - `email`: User email address
  - `role`: Access level (public, user, admin, god)
  - `bio`: Optional user biography
  - `profilePicture`: Optional avatar URL
  - `createdAt`: Registration timestamp

#### Credentials
- **Key**: `db_credentials`
- **Type**: `Record<string, string>`
- **Description**: SHA-512 hashed passwords mapped to usernames
- **Security**: Passwords are NEVER stored in plain text
- **Format**: `{ username: sha512Hash }`

### Application Data

#### Workflows
- **Key**: `db_workflows`
- **Type**: `Workflow[]`
- **Description**: Visual workflow definitions with nodes and edges
- **Fields**:
  - `id`: Workflow identifier
  - `name`: Workflow name
  - `description`: Optional description
  - `nodes`: Array of workflow nodes (triggers, actions, conditions, Lua scripts)
  - `edges`: Array of connections between nodes
  - `enabled`: Whether workflow is active

#### Lua Scripts
- **Key**: `db_lua_scripts`
- **Type**: `LuaScript[]`
- **Description**: Reusable Lua lambda functions
- **Fields**:
  - `id`: Script identifier
  - `name`: Script name
  - `description`: Optional description
  - `code`: Lua source code
  - `parameters`: Array of parameter definitions
  - `returnType`: Expected return type

#### Pages
- **Key**: `db_pages`
- **Type**: `PageConfig[]`
- **Description**: Page configurations for each application level
- **Fields**:
  - `id`: Page identifier
  - `path`: URL path
  - `title`: Page title
  - `level`: Application level (1-4)
  - `componentTree`: Hierarchical component structure
  - `requiresAuth`: Whether authentication is required
  - `requiredRole`: Minimum role to access

#### Data Schemas
- **Key**: `db_schemas`
- **Type**: `ModelSchema[]`
- **Description**: Data model definitions for Level 3 admin panel
- **Fields**:
  - `name`: Model name
  - `label`: Display label
  - `labelPlural`: Plural form
  - `icon`: Icon identifier
  - `fields`: Array of field definitions with types, validation, relations
  - `listDisplay`: Fields to show in list view
  - `searchFields`: Searchable fields

### User-Generated Content

#### Comments
- **Key**: `db_comments`
- **Type**: `Comment[]`
- **Description**: User comments and discussions
- **Fields**:
  - `id`: Comment identifier
  - `userId`: Author user ID
  - `content`: Comment text
  - `createdAt`: Creation timestamp
  - `updatedAt`: Last edit timestamp
  - `parentId`: Optional parent comment for threading

### UI Configuration

#### Component Hierarchy
- **Key**: `db_component_hierarchy`
- **Type**: `Record<string, ComponentNode>`
- **Description**: Tree structure of UI components
- **Fields**:
  - `id`: Node identifier
  - `type`: Component type
  - `parentId`: Parent node ID
  - `childIds`: Array of child node IDs
  - `order`: Display order
  - `pageId`: Associated page

#### Component Configs
- **Key**: `db_component_configs`
- **Type**: `Record<string, ComponentConfig>`
- **Description**: Component properties and styling
- **Fields**:
  - `id`: Config identifier
  - `componentId`: Associated component
  - `props`: Component properties
  - `styles`: CSS styling
  - `events`: Event handlers
  - `conditionalRendering`: Rendering conditions

### Application Configuration
- **Key**: `db_app_config`
- **Type**: `AppConfiguration`
- **Description**: Global application settings
- **Fields**:
  - `id`: Config identifier
  - `name`: Application name
  - `schemas`: Array of data schemas
  - `workflows`: Array of workflows
  - `luaScripts`: Array of Lua scripts
  - `pages`: Array of page configs
  - `theme`: Theme configuration (colors, fonts)

## Database API

The `Database` class provides a comprehensive API for all data operations:

### User Management
```typescript
Database.getUsers(): Promise<User[]>
Database.setUsers(users: User[]): Promise<void>
Database.addUser(user: User): Promise<void>
Database.updateUser(userId: string, updates: Partial<User>): Promise<void>
Database.deleteUser(userId: string): Promise<void>
```

### Credential Management
```typescript
Database.getCredentials(): Promise<Record<string, string>>
Database.setCredential(username: string, passwordHash: string): Promise<void>
Database.verifyCredentials(username: string, password: string): Promise<boolean>
```

### Workflow Management
```typescript
Database.getWorkflows(): Promise<Workflow[]>
Database.setWorkflows(workflows: Workflow[]): Promise<void>
Database.addWorkflow(workflow: Workflow): Promise<void>
Database.updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<void>
Database.deleteWorkflow(workflowId: string): Promise<void>
```

### Lua Script Management
```typescript
Database.getLuaScripts(): Promise<LuaScript[]>
Database.setLuaScripts(scripts: LuaScript[]): Promise<void>
Database.addLuaScript(script: LuaScript): Promise<void>
Database.updateLuaScript(scriptId: string, updates: Partial<LuaScript>): Promise<void>
Database.deleteLuaScript(scriptId: string): Promise<void>
```

### Page Management
```typescript
Database.getPages(): Promise<PageConfig[]>
Database.setPages(pages: PageConfig[]): Promise<void>
Database.addPage(page: PageConfig): Promise<void>
Database.updatePage(pageId: string, updates: Partial<PageConfig>): Promise<void>
Database.deletePage(pageId: string): Promise<void>
```

### Schema Management
```typescript
Database.getSchemas(): Promise<ModelSchema[]>
Database.setSchemas(schemas: ModelSchema[]): Promise<void>
Database.addSchema(schema: ModelSchema): Promise<void>
Database.updateSchema(schemaName: string, updates: Partial<ModelSchema>): Promise<void>
Database.deleteSchema(schemaName: string): Promise<void>
```

### Comment Management
```typescript
Database.getComments(): Promise<Comment[]>
Database.setComments(comments: Comment[]): Promise<void>
Database.addComment(comment: Comment): Promise<void>
Database.updateComment(commentId: string, updates: Partial<Comment>): Promise<void>
Database.deleteComment(commentId: string): Promise<void>
```

### Component Management
```typescript
Database.getComponentHierarchy(): Promise<Record<string, ComponentNode>>
Database.setComponentHierarchy(hierarchy: Record<string, ComponentNode>): Promise<void>
Database.addComponentNode(node: ComponentNode): Promise<void>
Database.updateComponentNode(nodeId: string, updates: Partial<ComponentNode>): Promise<void>
Database.deleteComponentNode(nodeId: string): Promise<void>

Database.getComponentConfigs(): Promise<Record<string, ComponentConfig>>
Database.setComponentConfigs(configs: Record<string, ComponentConfig>): Promise<void>
Database.addComponentConfig(config: ComponentConfig): Promise<void>
Database.updateComponentConfig(configId: string, updates: Partial<ComponentConfig>): Promise<void>
Database.deleteComponentConfig(configId: string): Promise<void>
```

### Global Configuration
```typescript
Database.getAppConfig(): Promise<AppConfiguration | null>
Database.setAppConfig(config: AppConfiguration): Promise<void>
```

### Database Operations
```typescript
Database.initializeDatabase(): Promise<void>
Database.exportDatabase(): Promise<string>
Database.importDatabase(jsonData: string): Promise<void>
Database.clearDatabase(): Promise<void>
```

## Password Security

### SHA-512 Hashing

All passwords are hashed using SHA-512 before storage:

```typescript
import { hashPassword, verifyPassword } from '@/lib/database'

// Register new user
const passwordHash = await hashPassword('userPassword123')
await Database.setCredential('username', passwordHash)

// Verify login
const isValid = await Database.verifyCredentials('username', 'userPassword123')
```

### Security Features

1. **No Plaintext Storage**: Passwords are never stored in plain text
2. **One-Way Hashing**: SHA-512 is cryptographically secure and cannot be reversed
3. **Credential Separation**: Password hashes stored separately from user data
4. **Secure Verification**: Password verification uses constant-time comparison

### Default Credentials

The system initializes with three default users:

| Username | Password | Role  | Access Level |
|----------|----------|-------|--------------|
| god      | god123   | god   | Level 4      |
| admin    | admin    | admin | Level 3      |
| demo     | demo     | user  | Level 2      |

**Important**: Change these passwords in production!

## Data Import/Export

### Export Format

Database exports are JSON files containing all entities:

```json
{
  "users": [...],
  "workflows": [...],
  "luaScripts": [...],
  "pages": [...],
  "schemas": [...],
  "comments": [...],
  "componentHierarchy": {...},
  "componentConfigs": {...},
  "appConfig": {...}
}
```

**Note**: Credentials (password hashes) are NOT included in exports for security.

### Export Database

```typescript
const jsonData = await Database.exportDatabase()
// Save to file or send to backup service
```

### Import Database

```typescript
const jsonData = /* load from file */
await Database.importDatabase(jsonData)
```

### Clear Database

```typescript
await Database.clearDatabase()
await Database.initializeDatabase() // Restore defaults
```

## Database Manager UI

The Database Manager component (Level 4 → Database tab) provides:

- **Real-time Statistics**: View record counts for all entities
- **Visual Overview**: Cards showing data distribution
- **Export/Import**: Backup and restore database
- **Clear Database**: Reset to defaults (with confirmation)
- **Key Inspector**: View all KV storage keys
- **Security Info**: Documentation of password hashing

## Migration from useKV

Previous versions used `useKV` hooks directly. The new Database layer provides:

1. **Centralized Logic**: All database operations in one place
2. **Consistent API**: Uniform CRUD operations across entities
3. **Enhanced Security**: Built-in password hashing
4. **Better Types**: Comprehensive TypeScript types
5. **Easier Testing**: Mockable database layer
6. **Data Portability**: Export/import functionality

### Migration Example

**Before:**
```typescript
const [users, setUsers] = useKV<User[]>('app_users', [])
setUsers((current) => [...(current || []), newUser])
```

**After:**
```typescript
await Database.addUser(newUser)
const users = await Database.getUsers()
```

## Best Practices

1. **Use Database methods**: Always use `Database.*` methods instead of direct KV access
2. **Handle async**: All Database operations are async
3. **Error handling**: Wrap Database calls in try-catch
4. **Type safety**: Use provided TypeScript types
5. **Password security**: Never log or expose password hashes
6. **Regular backups**: Export database periodically
7. **Test imports**: Validate JSON before importing
8. **Monitor storage**: Check database statistics regularly

## Performance Considerations

- **Batch operations**: Use set methods for multiple records
- **Lazy loading**: Load data only when needed
- **Caching**: Store frequently accessed data in component state
- **Pagination**: Limit large lists (comments, users)
- **Debouncing**: Debounce rapid updates
- **Indexing**: Use Map/Set for lookups instead of array.find()

## Troubleshooting

### Database not persisting
- Check that KV API is available
- Verify async operations complete
- Look for runtime errors in console

### Password verification failing
- Ensure password is hashed before storing
- Check username is correct
- Verify credentials initialized

### Import fails
- Validate JSON structure
- Check all required fields present
- Ensure compatible version

### Storage quota exceeded
- Export and clear old data
- Optimize large fields (compress JSON)
- Implement data cleanup policies
