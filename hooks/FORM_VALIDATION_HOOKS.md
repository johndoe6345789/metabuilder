# Form Validation & Input Hooks

Complete collection of reusable React hooks for managing form state, validation, and input handling. Located in `/hooks/`.

## Available Hooks

### 1. useValidation - Schema-Based Validation Wrapper

**File**: `/hooks/useValidation.ts`

Generic schema-based validation wrapper supporting field-level error tracking and bulk validation.

**Features**:
- Schema-based field validators
- Field-level and form-level validation
- Error state management
- Manual error setting/clearing

**API**:
```typescript
interface UseValidationReturn<T extends Record<string, any>> {
  errors: ValidationErrors<T>
  isValid: boolean
  hasError: (field: keyof T) => boolean
  getFieldError: (field: keyof T) => string | undefined
  validate: (data: Partial<T>) => boolean
  validateField: (field: keyof T, value: T[keyof T]) => boolean
  setFieldError: (field: keyof T, error: string) => void
  setErrors: (errors: ValidationErrors<T>) => void
  clearError: (field: keyof T) => void
  clearErrors: () => void
}
```

**Usage**:
```typescript
const schema = {
  username: (value) => value.length >= 3 ? '' : 'Min 3 chars',
  email: (value) => /^[^@]+@[^@]+$/.test(value) ? '' : 'Invalid email'
}

const { errors, isValid, validate, validateField, clearErrors } = useValidation(schema)

// Validate all fields
validate({ username: 'john', email: 'john@example.com' })

// Validate single field
validateField('email', 'john@example.com')

// Check validity
if (isValid) {
  // submit form
}
```

---

### 2. useInput - Controlled Input State Management

**File**: `/hooks/useInput.ts`

Manages controlled input state for text fields, textareas, and text-based inputs with optional validation.

**Features**:
- Value state with dirty/touched tracking
- Automatic error clearing on user input
- Optional validation on blur
- Value transformation (trim, custom transforms)
- Reset to initial state

**API**:
```typescript
interface UseInputReturn {
  value: string
  isDirty: boolean
  isTouched: boolean
  error: string
  isValid: boolean
  handlers: {
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    onBlur: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    setValue: (value: string) => void
    setError: (error: string) => void
    clearError: () => void
    reset: () => void
    touch: () => void
    validate: () => boolean
  }
}
```

**Usage**:
```typescript
const { value, error, isDirty, handlers } = useInput('', {
  initialValue: 'John',
  trim: true,
  onValidate: (v) => v.length >= 3 ? '' : 'Min 3 chars',
  onChange: (v) => console.log('Changed:', v),
  transform: (v) => v.toUpperCase()
})

return (
  <input
    value={value}
    onChange={handlers.onChange}
    onBlur={handlers.onBlur}
  />
)
```

---

### 3. useCheckbox - Checkbox State Management

**File**: `/hooks/useCheckbox.ts`

Manages single and multiple checkbox states with validation and group operations.

**Features (Single Checkbox)**:
- Checked state with dirty/touched tracking
- Toggle and reset operations
- Optional validation

**Features (Multiple Checkboxes)**:
- Group state management
- Individual toggle, check all, uncheck all
- Indeterminate state detection
- Checked count tracking

**API (Single)**:
```typescript
interface UseCheckboxSingleReturn {
  checked: boolean
  isDirty: boolean
  isTouched: boolean
  error: string
  isValid: boolean
  handlers: {
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
    setChecked: (checked: boolean) => void
    toggle: () => void
    reset: () => void
    touch: () => void
    validate: () => boolean
    setError: (error: string) => void
    clearError: () => void
  }
}
```

**API (Multiple)**:
```typescript
interface UseCheckboxMultiReturn<T extends Record<string, boolean>> {
  values: T
  isDirty: boolean
  isTouched: boolean
  error: string
  isValid: boolean
  count: number
  isAllChecked: boolean
  isIndeterminate: boolean
  handlers: {
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
    setValues: (values: T) => void
    isChecked: (field: keyof T) => boolean
    toggle: (field: keyof T) => void
    toggleAll: (checked: boolean) => void
    uncheckAll: () => void
    checkAll: () => void
    reset: () => void
    touch: () => void
    validate: () => boolean
    setError: (error: string) => void
    clearError: () => void
  }
}
```

**Usage**:
```typescript
// Single checkbox
const { checked, handlers } = useCheckbox(false)

// Multiple checkboxes
const { values, handlers, isAllChecked, count } = useCheckbox(
  { admin: false, user: false, guest: false },
  {
    onValidate: (vals) => Object.values(vals).some(v => v) ? '' : 'Select at least one'
  }
)

return (
  <>
    <input
      type="checkbox"
      checked={values.admin}
      onChange={handlers.onChange}
      name="admin"
    />
    <button onClick={() => handlers.checkAll()}>Check All</button>
  </>
)
```

---

### 4. useSelect - Select Dropdown State

**File**: `/hooks/useSelect.ts`

Manages single and multi-select dropdown states with search filtering and validation.

**Features (Single Select)**:
- Single value selection
- Option searching/filtering
- Clearable selections
- Dirty/touched tracking

**Features (Multi-Select)**:
- Multiple value selection
- Add/remove individual options
- Clear all, toggle options
- Selection count tracking

**API**:
```typescript
export interface SelectOption<T = string> {
  value: T
  label: string
  disabled?: boolean
  group?: string
}

interface UseSelectSingleReturn<T> {
  value: T | null
  isDirty: boolean
  isTouched: boolean
  error: string
  isValid: boolean
  searchTerm: string
  filteredOptions: SelectOption<T>[]
  handlers: {
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void
    setValue: (value: T | null) => void
    clear: () => void
    reset: () => void
    touch: () => void
    validate: () => boolean
    setError: (error: string) => void
    clearError: () => void
    setSearchTerm: (term: string) => void
    getOptionLabel: (value: T | null) => string
  }
}

interface UseSelectMultiReturn<T> {
  values: T[]
  isDirty: boolean
  isTouched: boolean
  error: string
  isValid: boolean
  searchTerm: string
  filteredOptions: SelectOption<T>[]
  count: number
  handlers: {
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void
    setValues: (values: T[]) => void
    isSelected: (value: T) => boolean
    toggleOption: (value: T) => void
    addOption: (value: T) => void
    removeOption: (value: T) => void
    clearAll: () => void
    reset: () => void
    touch: () => void
    validate: () => boolean
    setError: (error: string) => void
    clearError: () => void
    setSearchTerm: (term: string) => void
  }
}
```

**Usage**:
```typescript
// Single select
const { value, handlers, filteredOptions } = useSelect(null, {
  options: [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' }
  ],
  searchable: true,
  clearable: true,
  onValidate: (v) => v ? '' : 'Required'
})

// Multi-select
const { values, handlers, count } = useSelect([], {
  options: [...],
  isMulti: true,
  searchable: true
})

return (
  <select
    multiple
    value={values}
    onChange={handlers.onChange}
  >
    {handlers.filteredOptions.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
)
```

---

### 5. useFieldArray - Dynamic Form Field Arrays

**File**: `/hooks/useFieldArray.ts`

Manages dynamic form field arrays with add/remove/reorder operations and field-level validation.

**Features**:
- Add/remove/insert/replace fields
- Reorder fields (move, swap)
- Field-level error tracking
- Min/max field constraints
- Array methods (push, pop, shift, unshift)
- Bulk validation

**API**:
```typescript
export interface FormField<T = unknown> {
  id: string
  value: T
}

interface UseFieldArrayReturn<T> {
  fields: FormField<T>[]
  isDirty: boolean
  isTouched: boolean
  errors: Record<number, string>
  count: number
  canAdd: boolean
  canRemove: boolean
  handlers: {
    append: (value: T, options?: { atIndex?: number }) => void
    prepend: (value: T) => void
    remove: (index: number) => void
    insert: (index: number, value: T) => void
    move: (from: number, to: number) => void
    swap: (indexA: number, indexB: number) => void
    replace: (index: number, value: T) => void
    replaceAll: (values: T[]) => void
    updateField: (index: number, value: Partial<T>) => void
    getField: (index: number) => FormField<T> | undefined
    clear: () => void
    reset: () => void
    shift: () => FormField<T> | undefined
    pop: () => FormField<T> | undefined
    unshift: (value: T) => void
    push: (value: T) => void
    touch: () => void
    validateField: (index: number) => boolean
    validateAll: () => boolean
    setFieldError: (index: number, error: string) => void
    clearFieldError: (index: number) => void
    clearErrors: () => void
  }
}
```

**Usage**:
```typescript
const { fields, handlers, errors, canAdd, canRemove } = useFieldArray(
  [{ name: '', email: '' }],
  {
    minFields: 1,
    maxFields: 5,
    validateField: (value, index) => {
      if (!value.email) return 'Email required'
      if (value.name.length < 2) return 'Name too short'
      return ''
    }
  }
)

return (
  <div>
    {fields.map((field, idx) => (
      <div key={field.id}>
        <input
          value={field.value.name}
          onChange={(e) => handlers.updateField(idx, { name: e.target.value })}
        />
        {errors[idx] && <span>{errors[idx]}</span>}
        <button
          onClick={() => handlers.remove(idx)}
          disabled={!canRemove}
        >
          Remove
        </button>
      </div>
    ))}
    <button
      onClick={() => handlers.append({ name: '', email: '' })}
      disabled={!canAdd}
    >
      Add Field
    </button>
  </div>
)
```

---

## Integration Examples

### Complete Form Example
```typescript
import { useValidation, useInput, useCheckbox, useSelect, useFieldArray } from '@/hooks'

const MyForm = () => {
  // Single input
  const name = useInput('', {
    onValidate: (v) => v.length >= 2 ? '' : 'Min 2 chars'
  })

  // Multiple checkboxes
  const permissions = useCheckbox({ read: false, write: false, admin: false })

  // Select dropdown
  const role = useSelect('user', {
    options: [
      { value: 'user', label: 'User' },
      { value: 'admin', label: 'Admin' }
    ]
  })

  // Dynamic fields
  const skills = useFieldArray(
    [{ name: '' }],
    {
      minFields: 1,
      maxFields: 10,
      validateField: (val) => !val.name ? 'Required' : ''
    }
  )

  // Form validation
  const { validate, isValid } = useValidation({
    name: (v) => v.length >= 2 ? '' : 'Min 2 chars',
    role: (v) => v ? '' : 'Required'
  })

  const handleSubmit = () => {
    const isFormValid = validate({
      name: name.value,
      role: role.value
    }) && skills.handlers.validateAll()

    if (isFormValid) {
      console.log('Submit:', {
        name: name.value,
        permissions: permissions.values,
        role: role.value,
        skills: skills.fields
      })
    }
  }

  return (
    <form>
      <input
        {...name.handlers.onChange}
        value={name.value}
      />
      {name.error && <span>{name.error}</span>}

      <select value={role.value} onChange={role.handlers.onChange}>
        {role.filteredOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {skills.fields.map((field, idx) => (
        <div key={field.id}>
          <input value={field.value.name} />
          {skills.errors[idx] && <span>{skills.errors[idx]}</span>}
        </div>
      ))}

      <button onClick={() => skills.handlers.append({ name: '' })}>Add Skill</button>
      <button onClick={handleSubmit}>Submit</button>
    </form>
  )
}
```

---

## Common Patterns

### Combining Multiple Hooks
```typescript
// Use with validation hook
const input = useInput('')
const validation = useValidation({ email: checkEmail })

const handleBlur = () => {
  validation.validateField('email', input.value)
  input.handlers.touch()
}
```

### Dirty State Tracking
```typescript
const input = useInput('initial')

// isDirty is true only when value differs from initial
if (input.isDirty) {
  console.log('Form has unsaved changes')
}
```

### Dynamic Field Arrays with Validation
```typescript
const fields = useFieldArray([], {
  maxFields: 5,
  validateField: (val, idx) => {
    if (!val.name) return 'Required'
    if (idx > 0 && val.name === fields.fields[idx - 1].value.name) {
      return 'Duplicate name'
    }
    return ''
  }
})
```

### Multi-Select with Search
```typescript
const select = useSelect([], {
  options: largeList,
  isMulti: true,
  searchable: true
})

// Filter options as user types
<input
  value={select.searchTerm}
  onChange={(e) => select.handlers.setSearchTerm(e.target.value)}
  placeholder="Search options..."
/>
```

---

## Dependencies

All hooks use only React core hooks:
- `useState` - State management
- `useCallback` - Handler memoization
- `ChangeEvent`, `FocusEvent` - Event types

`useFieldArray` additionally uses `nanoid` for unique field IDs.

---

## Type Safety

All hooks are fully typed with TypeScript:
- Generic types for any data structure
- Field-level type inference
- Proper event handler typing
- Validation schema type safety

```typescript
// Fully typed validation schema
type FormData = { name: string; age: number; email: string }
const schema: ValidationSchema<FormData> = {
  name: (v) => v.length > 0 ? '' : 'Required',
  age: (v) => v > 0 ? '' : 'Invalid age',
  email: (v) => v.includes('@') ? '' : 'Invalid email'
}
```

---

## Performance Considerations

- All handlers use `useCallback` to prevent unnecessary re-renders
- Error state updates are batched where possible
- Field validation is memoized and only runs when needed
- Dirty state uses object comparison for multi-value hooks

---

## Status

All 5 hooks are:
- ✅ Fully implemented
- ✅ Production-ready
- ✅ Fully typed (TypeScript)
- ✅ Extensively tested
- ✅ Used across codebase
