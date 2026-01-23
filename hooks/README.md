# Form Validation & Input Hooks

Comprehensive collection of production-ready React hooks for managing form state, validation, and input handling.

## 🎯 Overview

5 powerful, fully-typed hooks for building complex forms with validation, state management, and error handling.

**Location**: `/hooks/`

## 📦 Available Hooks

### 1. **useValidation** - Schema-Based Form Validation
- Generic schema-based validation
- Field-level error tracking
- Bulk form validation
- Manual error management

**File**: `useValidation.ts` (198 lines)

```typescript
const { errors, isValid, validate, validateField } = useValidation(schema)
```

### 2. **useInput** - Controlled Text Input State
- Dirty/touched tracking
- Optional validation on blur
- Value transformation
- Auto-reset on error

**File**: `useInput.ts` (199 lines)

```typescript
const { value, error, handlers } = useInput('', { onValidate })
```

### 3. **useCheckbox** - Checkbox State Management
- Single checkbox OR checkbox groups
- Indeterminate state detection
- Check all/uncheck all operations
- Count tracking

**File**: `useCheckbox.ts` (418 lines)

```typescript
// Single
const { checked, handlers } = useCheckbox(false)

// Multiple
const { values, handlers, isAllChecked } = useCheckbox({ read: false, write: false })
```

### 4. **useSelect** - Select Dropdown State
- Single select OR multi-select
- Search/filter options
- Clearable selections
- Option label tracking

**File**: `useSelect.ts` (467 lines)

```typescript
// Single
const { value, handlers } = useSelect('option1', { options })

// Multiple
const { values, handlers, count } = useSelect([], { options, isMulti: true })
```

### 5. **useFieldArray** - Dynamic Form Arrays
- Add/remove/reorder fields
- Min/max constraints
- Field-level validation
- Array-like methods (push, pop, shift, unshift)

**File**: `useFieldArray.ts` (484 lines)

```typescript
const { fields, handlers, canAdd, canRemove } = useFieldArray([], { maxFields: 5 })
```

## 🚀 Quick Start

### Installation
All hooks are included in the project - no additional installation needed.

### Import
```typescript
import { useValidation } from '@/hooks/useValidation'
import { useInput } from '@/hooks/useInput'
import { useCheckbox } from '@/hooks/useCheckbox'
import { useSelect } from '@/hooks/useSelect'
import { useFieldArray } from '@/hooks/useFieldArray'
```

### Basic Example
```typescript
'use client'

import { useInput, useSelect, useCheckbox } from '@/hooks'

export const ContactForm = () => {
  const name = useInput('', {
    onValidate: (v) => v.length >= 2 ? '' : 'Min 2 chars'
  })

  const country = useSelect('us', {
    options: [
      { value: 'us', label: 'USA' },
      { value: 'uk', label: 'UK' }
    ]
  })

  const subscribe = useCheckbox(false)

  return (
    <form>
      <input value={name.value} onChange={name.handlers.onChange} />
      {name.error && <span>{name.error}</span>}

      <select value={country.value} onChange={country.handlers.onChange}>
        {country.filteredOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <label>
        <input
          type="checkbox"
          checked={subscribe.checked}
          onChange={subscribe.handlers.onChange}
        />
        Subscribe
      </label>

      <button type="submit">Submit</button>
    </form>
  )
}
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **FORM_VALIDATION_HOOKS.md** | Complete API reference for all 5 hooks |
| **QUICK_REFERENCE.md** | Quick start guide with 30+ code examples |
| **EXPORT_GUIDE.md** | Import methods, type exports, troubleshooting |
| **README.md** | This file |

## ✨ Features

### All Hooks Provide
- ✅ State tracking (value, isDirty, isTouched)
- ✅ Error handling with field-level messages
- ✅ Validation (field-level or bulk)
- ✅ Reset to initial state
- ✅ Touch tracking for conditional error display
- ✅ Fully typed with TypeScript
- ✅ useCallback memoization for performance

### Hook-Specific Features

| Feature | useValidation | useInput | useCheckbox | useSelect | useFieldArray |
|---------|:---:|:---:|:---:|:---:|:---:|
| Schema validation | ✅ | | | | |
| Multi-field validation | ✅ | | | | |
| Text input management | | ✅ | | | |
| Value transformation | | ✅ | | | |
| Single checkbox | | | ✅ | | |
| Checkbox groups | | | ✅ | | |
| Indeterminate state | | | ✅ | | |
| Single select | | | | ✅ | |
| Multi-select | | | | ✅ | |
| Search/filter | | | | ✅ | |
| Dynamic arrays | | | | | ✅ |
| Array operations | | | | | ✅ |
| Min/max constraints | | | | | ✅ |

## 🎨 Use Cases

### Form Building
```typescript
const form = {
  name: useInput(''),
  email: useInput(''),
  country: useSelect('us', { options }),
  agree: useCheckbox(false)
}
```

### Dynamic Lists
```typescript
const skills = useFieldArray(
  [{ name: '' }],
  { minFields: 1, maxFields: 10 }
)
```

### Permission Management
```typescript
const permissions = useCheckbox({
  read: false,
  write: false,
  delete: false,
  admin: false
})
```

### Multi-Select Filtering
```typescript
const tags = useSelect([], {
  options: allTags,
  isMulti: true,
  searchable: true
})
```

### Cross-Field Validation
```typescript
const password = useInput('')
const confirm = useInput('', {
  onValidate: (v) => v !== password.value ? 'Passwords must match' : ''
})
```

## 🔧 API Summary

### Common Handlers
All hooks return `handlers` object with methods:
- `onChange()` - Handle change events
- `reset()` - Reset to initial state
- `touch()` - Mark as touched
- `validate()` - Manually validate
- `setError()`, `clearError()` - Manual error control

### Common State
All hooks return:
```typescript
{
  isDirty: boolean      // Changed from initial
  isTouched: boolean    // User interacted
  error: string         // Validation error
  isValid: boolean      // No errors
  handlers: { ... }     // Event handlers
}
```

## 🎯 TypeScript Support

Full generic type support:
```typescript
type FormData = {
  name: string
  age: number
  email: string
}

const schema: ValidationSchema<FormData> = {
  name: (v) => v.length > 0 ? '' : 'Required',
  age: (v) => v > 0 ? '' : 'Invalid',
  email: (v) => v.includes('@') ? '' : 'Invalid'
}
```

## 🔒 Performance

All hooks are optimized with:
- `useCallback` memoization on all handlers
- Minimal re-renders
- Efficient state updates
- No unnecessary computations

## 📱 Browser Support

- Chrome 70+
- Firefox 63+
- Safari 12+
- Edge 79+
- React 16.8+

## 🧪 Testing

All hooks are testable with React Testing Library:
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { useInput } from '@/hooks/useInput'

test('tracks dirty state', () => {
  const Component = () => {
    const input = useInput('initial')
    return <input {...input.handlers.onChange} />
  }

  render(<Component />)
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'changed' } })
  // Assert isDirty === true
})
```

## 📋 Requirements

### Peer Dependencies
- `react` 16.8+ (hooks support)
- `react-dom` 16.8+

### Dependencies
- `nanoid` (for useFieldArray unique IDs)

### Optional
- `react-redux` (for integration)
- `@reduxjs/toolkit` (for Redux integration)

## 🚦 Status

| Hook | Status | Version | Last Updated |
|------|--------|---------|--------------|
| useValidation | ✅ Production | 1.0.0 | 2026-01-23 |
| useInput | ✅ Production | 1.0.0 | 2026-01-23 |
| useCheckbox | ✅ Production | 1.0.0 | 2026-01-23 |
| useSelect | ✅ Production | 1.0.0 | 2026-01-23 |
| useFieldArray | ✅ Production | 1.0.0 | 2026-01-23 |

## 📖 Examples

### Complete Contact Form
See `QUICK_REFERENCE.md` for 30+ working examples including:
- Simple text input
- Checkbox validation
- Multi-select with search
- Dynamic field arrays
- Async validation
- Dependent field validation
- Complex multi-field forms

### Example: Newsletter Signup
```typescript
export const NewsletterSignup = () => {
  const email = useInput('', {
    onValidate: (v) => /^[^@]+@[^@]+$/.test(v) ? '' : 'Invalid email'
  })

  const preferences = useCheckbox({
    weekly: true,
    monthly: false,
    deals: true
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email.isValid && preferences.isValid) {
      console.log('Subscribe:', {
        email: email.value,
        preferences: preferences.values
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email.value}
        onChange={email.handlers.onChange}
        placeholder="your@email.com"
      />
      {email.error && <span className="error">{email.error}</span>}

      <fieldset>
        <legend>Frequency</legend>
        {Object.keys(preferences.values).map(key => (
          <label key={key}>
            <input
              type="checkbox"
              checked={preferences.values[key]}
              onChange={preferences.handlers.onChange}
              name={key}
            />
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </label>
        ))}
      </fieldset>

      <button type="submit">Subscribe</button>
    </form>
  )
}
```

## 🔗 Files Included

```
/hooks/
├── useValidation.ts          (198 lines) - Schema validation
├── useInput.ts               (199 lines) - Text input state
├── useCheckbox.ts            (418 lines) - Checkbox management
├── useSelect.ts              (467 lines) - Select/dropdown state
├── useFieldArray.ts          (484 lines) - Dynamic arrays
├── FORM_VALIDATION_HOOKS.md  - Complete API docs
├── QUICK_REFERENCE.md        - Quick start + examples
├── EXPORT_GUIDE.md           - Import & export guide
└── README.md                 - This file
```

Total code: ~1,766 lines | Documentation: ~1,200 lines

## 💡 Best Practices

1. **Use schema validation** - Define validators centrally with `useValidation`
2. **Leverage dirty tracking** - Only show errors after user changes
3. **Use touched state** - Show validation after blur, not on render
4. **Reset on success** - Clear form after successful submission
5. **Combine hooks** - Use multiple hooks for complex forms
6. **Type your data** - Always use TypeScript for form data
7. **Memoize in components** - Use `useCallback` wrapping form components
8. **Test error states** - Test both valid and invalid states

## 🤝 Contributing

All hooks follow the same patterns:
1. State management with `useState`
2. Handler memoization with `useCallback`
3. Consistent API across all hooks
4. Full TypeScript support
5. Comprehensive JSDoc comments

## 📞 Support

For issues or questions:
1. Check `QUICK_REFERENCE.md` for examples
2. Review `FORM_VALIDATION_HOOKS.md` API docs
3. See `EXPORT_GUIDE.md` for common issues
4. Review hook source code with JSDoc comments

## 📄 License

Same as main project

---

## Quick Links

- 📖 [Full API Reference](./FORM_VALIDATION_HOOKS.md)
- 🚀 [Quick Start Guide](./QUICK_REFERENCE.md)
- 📦 [Export & Import Guide](./EXPORT_GUIDE.md)
- 💻 [View Source Code](.)

**Created**: 2026-01-23 | **Status**: Production Ready ✅
