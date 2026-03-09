# Code Style Guide

This document outlines the coding standards and best practices for the PostgreSQL Admin Panel project.

## General Principles

### 1. Keep Components Small and Reusable
- **Maximum component size**: ~200 lines of code
- **Single Responsibility**: Each component should do one thing well
- **Reusability**: Extract common patterns into shared components
- **Example**: Instead of a 1000+ line dashboard, break it into:
  - `TableManagerTab.tsx` (table management UI)
  - `ColumnManagerTab.tsx` (column management UI)
  - `CreateTableDialog.tsx` (reusable dialog)
  - `ColumnDialog.tsx` (reusable for add/modify/drop)

### 2. Configuration-Driven Architecture
- **Use JSON configuration**: Define features in `src/config/features.json`
- **Don't hardcode**: Pull data types, actions, and UI settings from config
- **Example**:
```typescript
// ❌ Bad - Hardcoded
const dataTypes = ['INTEGER', 'VARCHAR', 'TEXT'];

// ✅ Good - Config-driven
import { getDataTypes } from '@/utils/featureConfig';
const dataTypes = getDataTypes().map(dt => dt.name);
```

### 3. Leverage Existing Utilities
- Use `src/utils/featureConfig.ts` functions:
  - `getFeatures()` - Get all enabled features
  - `getFeatureById(id)` - Get specific feature config
  - `getDataTypes()` - Get database data types
  - `getNavItems()` - Get navigation items

## TypeScript Standards

### Type Definitions
```typescript
// ✅ Good - Explicit types
type TableManagerTabProps = {
  tables: Array<{ table_name: string }>;
  onCreateTable: (tableName: string, columns: any[]) => Promise<void>;
  onDropTable: (tableName: string) => Promise<void>;
};

// ❌ Bad - Using 'any' without reason
function handleData(data: any) { }

// ✅ Good - Proper typing
function handleData(data: { id: number; name: string }) { }
```

### Avoid Type Assertions
```typescript
// ❌ Bad
const value = response as SomeType;

// ✅ Good - Validate first
if (isValidType(response)) {
  const value = response;
}
```

## React/Next.js Standards

### Component Structure
```typescript
'use client'; // Only if component uses client-side features

import { useState } from 'react'; // React imports first
import { Button } from '@mui/material'; // Third-party imports
import { getFeatures } from '@/utils/featureConfig'; // Local imports

type ComponentProps = {
  // Props type definition
};

export default function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 1. Hooks
  const [state, setState] = useState();
  
  // 2. Derived state
  const derivedValue = useMemo(() => compute(), [deps]);
  
  // 3. Handlers
  const handleClick = () => { };
  
  // 4. Effects
  useEffect(() => { }, []);
  
  // 5. Render
  return <div>...</div>;
}
```

### Client vs Server Components
```typescript
// ✅ Server Component (default) - No 'use client'
export default function ServerComponent() {
  // Can fetch data, use async/await
  // Cannot use hooks, events, or browser APIs
  return <div>Static content</div>;
}

// ✅ Client Component - Add 'use client'
'use client';
export default function ClientComponent() {
  const [state, setState] = useState();
  return <button onClick={() => setState()}>Click</button>;
}
```

### Prop Naming
```typescript
// ✅ Good - Clear and consistent
type DialogProps = {
  open: boolean;           // State boolean
  onClose: () => void;     // Event handler (on*)
  onCreate: (data) => Promise<void>; // Async handler
  tables: Table[];         // Plural for arrays
  selectedTable: string;   // Singular for single value
};

// ❌ Bad - Unclear naming
type DialogProps = {
  isOpen: boolean;         // Don't use 'is' prefix unnecessarily
  close: () => void;       // Missing 'on' prefix
  data: any;               // Too generic
};
```

## File Organization

### Directory Structure
```
src/
├── app/                    # Next.js pages and routes
│   ├── admin/             # Admin pages
│   └── api/               # API routes
├── components/            # Reusable React components
│   └── admin/            # Admin-specific components
├── config/               # Configuration files
│   └── features.json     # Feature definitions (USE THIS!)
├── utils/                # Utility functions
│   └── featureConfig.ts  # Config helpers (USE THIS!)
├── models/               # Database models
└── types/                # TypeScript type definitions
```

### File Naming
- **Components**: PascalCase - `TableManagerTab.tsx`
- **Utilities**: camelCase - `featureConfig.ts`
- **Tests**: Same as source + `.test.ts` - `featureConfig.test.ts`
- **Types**: PascalCase - `UserTypes.ts`

## Component Patterns

### Small, Focused Components
```typescript
// ✅ Good - Small, single purpose
export default function CreateTableDialog({ open, onClose, onCreate }) {
  // Only handles table creation dialog
  return <Dialog>...</Dialog>;
}

// ❌ Bad - Too many responsibilities
export default function AdminDashboard() {
  // 1000+ lines handling:
  // - Navigation
  // - Table management
  // - Column management
  // - Query execution
  // - All dialogs inline
}
```

### Reusable Dialog Pattern
```typescript
// ✅ Good - Reusable for multiple operations
export default function ColumnDialog({
  open,
  mode, // 'add' | 'modify' | 'drop'
  onSubmit,
}) {
  // Single dialog component, multiple use cases
}

// Usage:
<ColumnDialog mode="add" onSubmit={handleAdd} />
<ColumnDialog mode="modify" onSubmit={handleModify} />
<ColumnDialog mode="drop" onSubmit={handleDrop} />
```

## State Management

### Local State
```typescript
// ✅ Good - Related state grouped
const [dialog, setDialog] = useState({ open: false, mode: 'add' });

// ❌ Bad - Too many separate states
const [openAddDialog, setOpenAddDialog] = useState(false);
const [openModifyDialog, setOpenModifyDialog] = useState(false);
const [openDropDialog, setOpenDropDialog] = useState(false);
```

### Async Operations
```typescript
// ✅ Good - Proper error handling
const handleSubmit = async () => {
  setLoading(true);
  try {
    await apiCall();
    setSuccess('Operation completed');
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

// ❌ Bad - No error handling
const handleSubmit = async () => {
  await apiCall();
  setSuccess('Done');
};
```

## API Route Standards

### Validation Pattern
```typescript
// ✅ Good - Validate inputs
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { tableName, columns } = await request.json();
  
  if (!tableName || !columns || columns.length === 0) {
    return NextResponse.json(
      { error: 'Table name and columns are required' },
      { status: 400 }
    );
  }

  if (!isValidIdentifier(tableName)) {
    return NextResponse.json(
      { error: 'Invalid table name format' },
      { status: 400 }
    );
  }

  // Process request...
}
```

### SQL Injection Prevention
```typescript
// ✅ Good - Validate identifiers
function isValidIdentifier(name: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

// ✅ Good - Use parameterized queries
await db.execute(sql`SELECT * FROM ${sql.identifier(tableName)}`);

// ❌ Bad - String concatenation
await db.execute(`SELECT * FROM ${tableName}`); // SQL injection risk!
```

## Testing Standards

### Test File Naming
- Unit tests: `ComponentName.test.tsx` or `utilityName.test.ts`
- Integration tests: `tests/integration/FeatureName.spec.ts`
- E2E tests: `tests/e2e/FeatureName.e2e.ts`

### Test Structure
```typescript
import { describe, expect, it } from 'vitest';

describe('FeatureName', () => {
  describe('Specific functionality', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Playwright Test Pattern
```typescript
test.describe('Feature Name', () => {
  test('should validate API endpoint', async ({ page }) => {
    const response = await page.request.post('/api/endpoint', {
      data: { field: 'value' },
    });
    
    expect(response.status()).toBe(200);
  });
});
```

## Material-UI Standards

### Component Usage
```typescript
// ✅ Good - Consistent spacing
<Box sx={{ mt: 2, mb: 2, p: 2 }}>
  <Button variant="contained" startIcon={<AddIcon />}>
    Add Item
  </Button>
</Box>

// ❌ Bad - Inconsistent styling
<div style={{ marginTop: '16px', padding: '10px' }}>
  <Button>Add Item</Button>
</div>
```

### Dialog Pattern
```typescript
// ✅ Good - Complete dialog structure
<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
  <DialogTitle>Title</DialogTitle>
  <DialogContent>
    {/* Content */}
  </DialogContent>
  <DialogActions>
    <Button onClick={onClose}>Cancel</Button>
    <Button variant="contained">Confirm</Button>
  </DialogActions>
</Dialog>
```

## Error Handling

### User-Facing Errors
```typescript
// ✅ Good - Clear, actionable messages
setError('Table name must contain only letters, numbers, and underscores');

// ❌ Bad - Technical jargon
setError('RegExp validation failed on identifier');
```

### API Errors
```typescript
// ✅ Good - Structured error responses
return NextResponse.json(
  { 
    error: 'Invalid table name format',
    details: 'Table names must start with a letter or underscore'
  },
  { status: 400 }
);
```

## Documentation

### Component Documentation
```typescript
/**
 * Dialog for creating a new database table
 * 
 * Features:
 * - Dynamic column builder
 * - Type selection from config
 * - Validation for table/column names
 * 
 * @example
 * <CreateTableDialog
 *   open={isOpen}
 *   onClose={handleClose}
 *   onCreate={handleCreate}
 * />
 */
export default function CreateTableDialog(props) { }
```

### Function Documentation
```typescript
/**
 * Validates if a string is a safe SQL identifier
 * Prevents SQL injection by ensuring only alphanumeric and underscore
 * 
 * @param name - The identifier to validate
 * @returns true if valid, false otherwise
 * 
 * @example
 * isValidIdentifier('my_table') // true
 * isValidIdentifier('my-table!') // false
 */
function isValidIdentifier(name: string): boolean { }
```

## Git Commit Standards

### Commit Message Format
```
type(scope): Short description

Longer description if needed

- List changes
- One per line
```

### Commit Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `test`: Adding tests
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `chore`: Maintenance tasks

### Examples
```
feat(admin): Add table manager UI component

- Create TableManagerTab component
- Extract CreateTableDialog to separate file
- Use features.json for configuration
- Add validation for table names

fix(api): Prevent SQL injection in table creation

- Add identifier validation
- Use parameterized queries
- Add security tests
```

## Performance Best Practices

### Avoid Unnecessary Re-renders
```typescript
// ✅ Good - Memoize callbacks
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);

// ✅ Good - Memoize expensive computations
const derivedData = useMemo(() => {
  return expensiveComputation(data);
}, [data]);
```

### Optimize Bundle Size
```typescript
// ✅ Good - Named imports
import { Button, TextField } from '@mui/material';

// ❌ Bad - Default imports (larger bundle)
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
```

## Security Best Practices

### Authentication
```typescript
// ✅ Good - Always check session first
const session = await getSession();
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Input Validation
```typescript
// ✅ Good - Validate all inputs
if (!isValidIdentifier(tableName)) {
  return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
}

// ✅ Good - Sanitize user input
const sanitized = tableName.trim().toLowerCase();
```

## ESLint & Prettier

This project uses ESLint and Prettier for code quality:

```bash
# Check code style
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Check TypeScript types
npm run check:types
```

### Key Rules
- **No unused variables**: Remove or prefix with `_`
- **Consistent quotes**: Single quotes for strings
- **Semicolons**: Required at end of statements
- **Indentation**: 2 spaces
- **Line length**: Max 100 characters (soft limit)
- **Trailing commas**: Required in multiline

## Quick Reference

### Component Checklist
- [ ] Less than 200 lines
- [ ] Uses feature config from JSON
- [ ] Has proper TypeScript types
- [ ] Includes error handling
- [ ] Has tests (if logic-heavy)
- [ ] Follows naming conventions
- [ ] Documented if complex

### PR Checklist
- [ ] Code follows style guide
- [ ] Components are small and reusable
- [ ] Uses configuration from features.json
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Linter passes
- [ ] Type checking passes
- [ ] No console.log statements
- [ ] Error handling implemented

---

**Last Updated**: January 2026
**Maintained by**: Development Team
**Questions?**: Open an issue with label `documentation`
