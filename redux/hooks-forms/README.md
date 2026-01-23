# @metabuilder/hooks-forms

Form management hooks for MetaBuilder with comprehensive validation, field arrays, and submission handling.

## Installation

```bash
npm install @metabuilder/hooks-forms
```

## Hooks

### useFormBuilder

Complete form state management with validation and field array support.

```typescript
import { useFormBuilder } from '@metabuilder/hooks-forms'

interface LoginForm {
  email: string
  password: string
  rememberMe: boolean
}

const form = useFormBuilder<LoginForm>({
  initialValues: {
    email: '',
    password: '',
    rememberMe: false,
  },
  validation: (values) => {
    const errors: ValidationErrors<LoginForm> = {}
    if (!values.email) {
      errors.email = 'Email is required'
    } else if (!values.email.includes('@')) {
      errors.email = 'Invalid email'
    }
    if (values.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }
    return errors
  },
  onSubmit: async (values) => {
    await loginApi(values)
  },
  validateOnBlur: true,
  validateOnChange: false,
})

// In component
return (
  <form onSubmit={(e) => { e.preventDefault(); form.submit() }}>
    <div>
      <input
        name="email"
        type="email"
        value={form.values.email}
        onChange={(e) => form.setFieldValue('email', e.target.value)}
        onBlur={() => form.setFieldTouched('email')}
      />
      {form.touched.email && form.errors.email && (
        <span className="error">{form.errors.email}</span>
      )}
    </div>

    <div>
      <input
        name="password"
        type="password"
        value={form.values.password}
        onChange={(e) => form.setFieldValue('password', e.target.value)}
        onBlur={() => form.setFieldTouched('password')}
      />
      {form.touched.password && form.errors.password && (
        <span className="error">{form.errors.password}</span>
      )}
    </div>

    <label>
      <input
        name="rememberMe"
        type="checkbox"
        checked={form.values.rememberMe}
        onChange={(e) => form.setFieldValue('rememberMe', e.target.checked)}
      />
      Remember me
    </label>

    <button type="submit" disabled={form.isSubmitting || !form.isValid}>
      {form.isSubmitting ? 'Logging in...' : 'Login'}
    </button>

    {form.submitError && (
      <div className="error">{form.submitError}</div>
    )}
  </form>
)
```

**Features:**
- Strongly typed form state
- Field-level and form-level validation
- Touched/dirty tracking per field
- Submit state and error handling
- Reset to initial values
- Optimized re-renders with field-level selectors

---

## Field Arrays

Manage dynamic form fields with add, remove, reorder operations.

```typescript
interface UserForm {
  name: string
  emails: string[]
}

const form = useFormBuilder<UserForm>({
  initialValues: {
    name: 'John',
    emails: ['john@example.com'],
  },
  onSubmit: async (values) => {
    await submitForm(values)
  },
})

const emailArray = form.getFieldArray('emails')

return (
  <form>
    {emailArray.values.map((email, index) => (
      <div key={index}>
        <input
          value={email}
          onChange={(e) => {
            const newEmails = [...emailArray.values]
            newEmails[index] = e.target.value
            form.setFieldValue('emails', newEmails)
          }}
        />
        <button onClick={() => emailArray.remove(index)}>Remove</button>
      </div>
    ))}
    <button onClick={() => emailArray.add('')}>Add Email</button>
  </form>
)
```

---

## API Reference

### useFormBuilder

```typescript
interface UseFormBuilderOptions<T> {
  initialValues: T
  validation?: (values: T) => ValidationErrors<T>
  onSubmit: (values: T) => Promise<void> | void
  validateOnBlur?: boolean
  validateOnChange?: boolean
}

interface UseFormBuilderReturn<T> {
  // Values
  values: T
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void
  setValues: (values: Partial<T>) => void

  // Errors
  errors: ValidationErrors<T>
  getFieldError: <K extends keyof T>(field: K) => string | undefined
  hasError: <K extends keyof T>(field: K) => boolean

  // Touched state
  touched: Partial<Record<keyof T, boolean>>
  setFieldTouched: <K extends keyof T>(field: K, isTouched?: boolean) => void
  setTouched: (touched: Partial<Record<keyof T, boolean>>) => void

  // Dirty state
  isDirty: boolean
  dirty: Partial<Record<keyof T, boolean>>
  resetField: <K extends keyof T>(field: K) => void

  // Submission
  submit: () => Promise<void>
  isSubmitting: boolean
  submitError: string | null

  // Form state
  reset: () => void
  isValid: boolean
  isValidating: boolean

  // Field arrays
  getFieldArray: <K extends keyof T>(
    field: K
  ) => T[K] extends any[] ? FormFieldArray<T[K][number]> : never
}

interface FormFieldArray<T> {
  values: T[]
  add: (value: T) => void
  remove: (index: number) => void
  insert: (index: number, value: T) => void
  move: (fromIndex: number, toIndex: number) => void
  clear: () => void
}
```

---

## Best Practices

1. **Validation timing**: Use `validateOnBlur: true` for better UX, `validateOnChange: false` to reduce noise
2. **Field arrays**: Always pass the updated array directly to `setFieldValue` for proper state updates
3. **Error display**: Only show errors when field is touched to avoid overwhelming users
4. **Custom validation**: Return an empty errors object for valid forms
5. **Async validation**: Implement in `onSubmit` after synchronous validation passes

## Examples

### Multi-step form

```typescript
const [step, setStep] = useState(1)

const form = useFormBuilder({
  initialValues: { name: '', email: '', password: '' },
  validation: (values) => {
    const errors: ValidationErrors = {}
    if (step === 1) {
      if (!values.name) errors.name = 'Required'
    } else if (step === 2) {
      if (!values.email) errors.email = 'Required'
    } else if (step === 3) {
      if (values.password.length < 8) errors.password = 'Min 8 chars'
    }
    return errors
  },
  onSubmit: async (values) => {
    await submitForm(values)
  },
})

const canProceed = () => {
  // Validate current step only
  if (step === 1) return !!form.values.name
  if (step === 2) return !!form.values.email
  if (step === 3) return form.values.password.length >= 8
  return true
}
```

### Conditional fields

```typescript
const form = useFormBuilder({
  initialValues: { userType: 'customer', companyName: '' },
  validation: (values) => {
    const errors: ValidationErrors = {}
    if (values.userType === 'business' && !values.companyName) {
      errors.companyName = 'Company name required for business accounts'
    }
    return errors
  },
  onSubmit: async (values) => {},
})

return (
  <>
    <select
      value={form.values.userType}
      onChange={(e) => form.setFieldValue('userType', e.target.value)}
    >
      <option value="customer">Customer</option>
      <option value="business">Business</option>
    </select>

    {form.values.userType === 'business' && (
      <input
        value={form.values.companyName}
        onChange={(e) => form.setFieldValue('companyName', e.target.value)}
        placeholder="Company name"
      />
    )}
  </>
)
```

---

## Related Packages

- `@metabuilder/hooks-utils` - Table and async operation hooks
- `@metabuilder/hooks` - Core custom hooks
