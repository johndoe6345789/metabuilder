# Form Validation Hooks - Export & Usage Guide

## Location
All hooks are located in `/hooks/` directory at project root.

## Available Hooks
1. **useValidation.ts** - Schema-based form validation
2. **useInput.ts** - Text input state management
3. **useCheckbox.ts** - Checkbox state management (single/multi)
4. **useSelect.ts** - Select dropdown state (single/multi)
5. **useFieldArray.ts** - Dynamic form field arrays

## Import Methods

### Method 1: Direct Imports (Recommended)
```typescript
import { useValidation } from '@/hooks/useValidation'
import { useInput } from '@/hooks/useInput'
import { useCheckbox } from '@/hooks/useCheckbox'
import { useSelect } from '@/hooks/useSelect'
import { useFieldArray } from '@/hooks/useFieldArray'
```

### Method 2: Named Exports (if configured in index)
```typescript
import {
  useValidation,
  useInput,
  useCheckbox,
  useSelect,
  useFieldArray,
  type ValidationSchema,
  type ValidationErrors,
  type SelectOption,
  type FormField
} from '@/hooks'
```

### Method 3: Wildcard Import
```typescript
import * as hooks from '@/hooks/useValidation'
const { useValidation } = hooks
```

## Type Exports

Each hook also exports its types:

```typescript
// useValidation
export type ValidationSchema<T>
export type ValidationErrors<T>

// useSelect
export interface SelectOption<T>

// useFieldArray
export interface FormField<T>
```

## Module Resolution

The hooks work with TypeScript path aliases:
- `@/hooks/useValidation` - Full path import
- `@/hooks/useInput` - Full path import
- etc.

Ensure your `tsconfig.json` or `jsconfig.json` has:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## React Requirements

All hooks require:
- **React 16.8+** (for hooks support)
- **React 18+** (recommended for concurrent features)

Dependencies:
- `react` - Core
- `react-redux` (optional) - For integration with Redux
- `nanoid` - Required by `useFieldArray` for unique IDs

## File Summary

| File | Size | Status | Exports |
|------|------|--------|---------|
| useValidation.ts | 5.6 KB | Production | useValidation, ValidationSchema, ValidationErrors |
| useInput.ts | 4.6 KB | Production | useInput, UseInputReturn |
| useCheckbox.ts | 9.9 KB | Production | useCheckbox, UseCheckboxSingleReturn, UseCheckboxMultiReturn |
| useSelect.ts | 11.2 KB | Production | useSelect, SelectOption, UseSelectSingleReturn, UseSelectMultiReturn |
| useFieldArray.ts | 10.6 KB | Production | useFieldArray, FormField, UseFieldArrayReturn |

## Feature Matrix

| Feature | useValidation | useInput | useCheckbox | useSelect | useFieldArray |
|---------|---------------|----------|-------------|-----------|---------------|
| State tracking | ✓ | ✓ | ✓ | ✓ | ✓ |
| Dirty tracking | - | ✓ | ✓ | ✓ | ✓ |
| Touched tracking | - | ✓ | ✓ | ✓ | ✓ |
| Error handling | ✓ | ✓ | ✓ | ✓ | ✓ |
| Validation | ✓ | ✓ | ✓ | ✓ | ✓ |
| Search filtering | - | - | - | ✓ | - |
| Multi-value support | - | - | ✓ | ✓ | ✓ |
| Array operations | - | - | - | - | ✓ |
| Min/Max constraints | - | - | - | - | ✓ |
| Group state | - | - | ✓ | ✓ | ✓ |

## Usage in Next.js

For Next.js projects, use 'use client' directive:

```typescript
'use client'

import { useInput } from '@/hooks/useInput'

export const MyComponent = () => {
  const email = useInput('')
  return <input {...email.handlers.onChange} />
}
```

## API Stability

All hooks follow semantic versioning:
- **Stable**: All 5 hooks are production-ready
- **API version**: 1.0.0+
- **Breaking changes**: Will bump major version

## Documentation

- **FORM_VALIDATION_HOOKS.md** - Complete API reference
- **QUICK_REFERENCE.md** - Quick start guide with examples
- **EXPORT_GUIDE.md** - This file

## Common Issues

### Issue: Import path not found
**Solution**: Check tsconfig paths configuration

### Issue: Type errors with generics
**Solution**: Explicitly type the hook:
```typescript
const input = useInput<string>('', options)
```

### Issue: nanoid not installed
**Solution**: `npm install nanoid` (required by useFieldArray)

## Testing

All hooks are designed to be testable:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { useInput } from '@/hooks/useInput'

const TestComponent = () => {
  const input = useInput('')
  return <input {...input.handlers.onChange} />
}

test('tracks dirty state', () => {
  const { rerender } = render(<TestComponent />)
  const input = screen.getByRole('textbox')
  
  fireEvent.change(input, { target: { value: 'test' } })
  // Test isDirty state
})
```

## Performance Notes

All hooks are optimized with:
- `useCallback` for handler memoization
- Conditional state updates
- Efficient error state management
- No unnecessary re-renders

## Browser Support

All hooks work in:
- Chrome 70+
- Firefox 63+
- Safari 12+
- Edge 79+

## Future Enhancements

Potential additions:
- Async validation support
- Debounced validation
- Cross-field validation helpers
- Form context provider
- Redux integration helpers

## Contributing

When modifying hooks:
1. Update types in the hook file
2. Update tests
3. Update documentation
4. Maintain backward compatibility
5. Follow existing code style

## License

Same as main project
