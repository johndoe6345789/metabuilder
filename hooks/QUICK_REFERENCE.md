# Form Hooks - Quick Reference

## Import All Hooks

```typescript
import {
  useValidation,
  useInput,
  useCheckbox,
  useSelect,
  useFieldArray
} from '@/hooks'
```

## Quick Start Examples

### 1. Simple Text Input
```typescript
const email = useInput('', {
  onValidate: (v) => /^[^@]+@[^@]+$/.test(v) ? '' : 'Invalid email'
})

return (
  <div>
    <input value={email.value} onChange={email.handlers.onChange} />
    {email.error && <span className="error">{email.error}</span>}
  </div>
)
```

### 2. Checkbox with Validation
```typescript
const agree = useCheckbox(false, {
  onValidate: (v) => v ? '' : 'You must agree'
})

return (
  <label>
    <input
      type="checkbox"
      checked={agree.checked}
      onChange={agree.handlers.onChange}
    />
    I agree to terms
    {agree.error && <span>{agree.error}</span>}
  </label>
)
```

### 3. Select Dropdown
```typescript
const country = useSelect(null, {
  options: [
    { value: 'us', label: 'USA' },
    { value: 'uk', label: 'UK' },
    { value: 'ca', label: 'Canada' }
  ],
  clearable: true
})

return (
  <select value={country.value || ''} onChange={country.handlers.onChange}>
    <option value="">Select country...</option>
    {country.filteredOptions.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
)
```

### 4. Multiple Checkboxes
```typescript
const permissions = useCheckbox({
  read: false,
  write: false,
  delete: false,
  admin: false
})

return (
  <div>
    {Object.keys(permissions.values).map(key => (
      <label key={key}>
        <input
          type="checkbox"
          checked={permissions.values[key]}
          onChange={permissions.handlers.onChange}
          name={key}
        />
        {key.charAt(0).toUpperCase() + key.slice(1)}
      </label>
    ))}
    <p>Selected: {permissions.count} / {Object.keys(permissions.values).length}</p>
  </div>
)
```

### 5. Dynamic Field Array
```typescript
const emails = useFieldArray(
  [{ value: '' }],
  {
    minFields: 1,
    maxFields: 5,
    validateField: (v) =>
      /^[^@]+@[^@]+$/.test(v.value) ? '' : 'Invalid email'
  }
)

return (
  <div>
    {emails.fields.map((field, idx) => (
      <div key={field.id}>
        <input
          value={field.value.value}
          onChange={(e) => emails.handlers.updateField(idx, { value: e.target.value })}
        />
        {emails.errors[idx] && <span>{emails.errors[idx]}</span>}
        <button
          onClick={() => emails.handlers.remove(idx)}
          disabled={!emails.canRemove}
        >
          Remove
        </button>
      </div>
    ))}
    <button
      onClick={() => emails.handlers.append({ value: '' })}
      disabled={!emails.canAdd}
    >
      Add Email ({emails.count}/{emails.fields.length})
    </button>
  </div>
)
```

### 6. Complete Contact Form
```typescript
export const ContactForm = () => {
  // Individual fields
  const name = useInput('', {
    onValidate: (v) => v.length >= 2 ? '' : 'Min 2 characters'
  })

  const email = useInput('', {
    onValidate: (v) => /^[^@]+@[^@]+$/.test(v) ? '' : 'Invalid email'
  })

  const subject = useSelect('general', {
    options: [
      { value: 'general', label: 'General Inquiry' },
      { value: 'support', label: 'Support' },
      { value: 'sales', label: 'Sales' }
    ]
  })

  const agree = useCheckbox(false, {
    onValidate: (v) => v ? '' : 'Required'
  })

  // Form-level validation
  const validation = useValidation({
    name: (v) => v.length >= 2 ? '' : 'Min 2 characters',
    email: (v) => /^[^@]+@[^@]+$/.test(v) ? '' : 'Invalid email',
    subject: (v) => v ? '' : 'Required',
    agree: (v) => v ? '' : 'Must agree'
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    const isValid = validation.validate({
      name: name.value,
      email: email.value,
      subject: subject.value,
      agree: agree.checked
    })

    if (isValid) {
      console.log('Submit:', {
        name: name.value,
        email: email.value,
        subject: subject.value,
        agree: agree.checked
      })
      // Reset form
      name.handlers.reset()
      email.handlers.reset()
      subject.handlers.reset()
      agree.handlers.reset()
      validation.clearErrors()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name</label>
        <input
          value={name.value}
          onChange={name.handlers.onChange}
          onBlur={name.handlers.onBlur}
        />
        {validation.getFieldError('name') && (
          <span className="error">{validation.getFieldError('name')}</span>
        )}
      </div>

      <div>
        <label>Email</label>
        <input
          type="email"
          value={email.value}
          onChange={email.handlers.onChange}
          onBlur={email.handlers.onBlur}
        />
        {validation.getFieldError('email') && (
          <span className="error">{validation.getFieldError('email')}</span>
        )}
      </div>

      <div>
        <label>Subject</label>
        <select value={subject.value || ''} onChange={subject.handlers.onChange}>
          <option value="">Select...</option>
          {subject.filteredOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {validation.getFieldError('subject') && (
          <span className="error">{validation.getFieldError('subject')}</span>
        )}
      </div>

      <label>
        <input
          type="checkbox"
          checked={agree.checked}
          onChange={agree.handlers.onChange}
        />
        I agree to terms
      </label>
      {validation.getFieldError('agree') && (
        <span className="error">{validation.getFieldError('agree')}</span>
      )}

      <button type="submit" disabled={!validation.isValid}>
        Submit
      </button>
    </form>
  )
}
```

## Hook Comparison

| Hook | Use Case | Type |
|------|----------|------|
| `useValidation` | Form-level schema validation | Validation |
| `useInput` | Text inputs, textareas | Single value |
| `useCheckbox` | Single or group checkboxes | Single/Group value |
| `useSelect` | Single or multi dropdowns | Single/Group value |
| `useFieldArray` | Dynamic field lists | Array value |

## State Properties

### All Hooks Include
```typescript
{
  isDirty: boolean        // Changed from initial
  isTouched: boolean      // User interacted
  error: string           // Validation error
  isValid: boolean        // No errors
}
```

### Array-Specific
```typescript
// useFieldArray additionally has:
{
  count: number           // Number of fields
  canAdd: boolean         // Can add more (< maxFields)
  canRemove: boolean      // Can remove (> minFields)
}

// useCheckbox (multi) additionally has:
{
  count: number           // Checked count
  isAllChecked: boolean   // All checked
  isIndeterminate: boolean // Some checked
}

// useSelect additionally has:
{
  searchTerm: string      // Search filter
  filteredOptions: []     // Filtered list
}
```

## Handler Methods

### useInput
```typescript
onChange()      // Handle input change
onBlur()        // Handle blur, validate
setValue()      // Set value programmatically
setError()      // Set custom error
clearError()    // Clear error
reset()         // Reset to initial
touch()         // Mark as touched
validate()      // Manually validate
```

### useCheckbox (Single)
```typescript
onChange()      // Handle checkbox change
setChecked()    // Set checked state
toggle()        // Toggle state
reset()         // Reset to initial
touch()         // Mark as touched
validate()      // Manually validate
setError()      // Set error
clearError()    // Clear error
```

### useCheckbox (Multi)
```typescript
onChange()      // Handle checkbox change
setValues()     // Set values
isChecked()     // Check if specific checkbox is checked
toggle()        // Toggle specific checkbox
toggleAll()     // Toggle all checkboxes
checkAll()      // Check all
uncheckAll()    // Uncheck all
reset()         // Reset to initial
touch()         // Mark as touched
validate()      // Manually validate
```

### useSelect (Single)
```typescript
onChange()      // Handle select change
setValue()      // Set value
clear()         // Clear selection
reset()         // Reset to initial
touch()         // Mark as touched
validate()      // Manually validate
setSearchTerm() // Filter options
getOptionLabel()// Get label for value
```

### useSelect (Multi)
```typescript
onChange()      // Handle select change
setValues()     // Set values
isSelected()    // Check if value selected
toggleOption()  // Toggle a value
addOption()     // Add a value
removeOption()  // Remove a value
clearAll()      // Clear all selections
reset()         // Reset to initial
touch()         // Mark as touched
validate()      // Manually validate
setSearchTerm() // Filter options
```

### useFieldArray
```typescript
append()        // Add field at end
prepend()       // Add field at start
insert()        // Insert at index
remove()        // Remove at index
move()          // Move from → to
swap()          // Swap two indices
replace()       // Replace at index
replaceAll()    // Replace all fields
updateField()   // Update partial field
getField()      // Get field at index
clear()         // Clear all
reset()         // Reset to initial
push()          // Array.push equivalent
pop()           // Array.pop equivalent
shift()         // Array.shift equivalent
unshift()       // Array.unshift equivalent
touch()         // Mark as touched
validateField() // Validate single field
validateAll()   // Validate all fields
setFieldError() // Set error for field
clearFieldError()// Clear error for field
clearErrors()   // Clear all errors
```

## Tips & Tricks

### 1. Auto-validate on blur
```typescript
const input = useInput('', {
  onValidate: myValidator
})

<input
  onBlur={input.handlers.onBlur} // Auto-validates
/>
```

### 2. Show errors only after touched
```typescript
{input.isTouched && input.error && <span>{input.error}</span>}
```

### 3. Disable submit while validating
```typescript
<button disabled={!validation.isValid || !input.isDirty}>
  Submit
</button>
```

### 4. Display touched state
```typescript
{input.isTouched && !input.isValid && <span className="warn">Invalid</span>}
```

### 5. Dynamic field defaults
```typescript
const fields = useFieldArray(
  Array(3).fill(null).map(() => ({ name: '', value: '' })),
  { maxFields: 10 }
)
```

### 6. Combine validations
```typescript
const isFormValid =
  name.isValid &&
  email.isValid &&
  agree.isValid &&
  fields.handlers.validateAll()
```

### 7. Dependent field validation
```typescript
const fields = useFieldArray([], {
  validateField: (val, idx) => {
    // Check for duplicates in other fields
    if (idx > 0) {
      const prev = fields.fields[idx - 1]?.value
      if (prev && prev.name === val.name) {
        return 'Duplicate name'
      }
    }
    return ''
  }
})
```

## Best Practices

1. **Use `useValidation` for form-level schema** - Define validation rules centrally
2. **Leverage `isDirty`** - Only show errors after user changes field
3. **Use `isTouched`** - Show errors after blur, not on initial render
4. **Reset on success** - Clear form after successful submission
5. **Combine hooks** - Use multiple hooks for complex forms
6. **Type your data** - Use TypeScript for form data structures
7. **Memoize callbacks** - Use `useCallback` in form components
8. **Handle async validation** - Use custom validators for API calls

## Common Patterns

### Pattern: Form with Async Validation
```typescript
const email = useInput('', {
  onValidate: async (v) => {
    const exists = await checkEmailExists(v)
    return exists ? 'Email already registered' : ''
  }
})
```

### Pattern: Conditional Fields
```typescript
const country = useSelect('us', { options: countries })
const province = useSelect(null, {
  options: country.value === 'ca' ? caProvinces : [],
  onValidate: (v) => country.value === 'ca' && !v ? 'Required' : ''
})
```

### Pattern: Dependent Validation
```typescript
const password = useInput('')
const confirm = useInput('', {
  onValidate: (v) => v !== password.value ? 'Passwords must match' : ''
})
```

### Pattern: Multi-Select with Limit
```typescript
const tags = useSelect([], {
  options: availableTags,
  isMulti: true,
  onValidate: (values) => {
    if (values.length < 2) return 'Select at least 2'
    if (values.length > 5) return 'Select max 5'
    return ''
  }
})
```
