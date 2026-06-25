import { describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFormState } from './use-form-state'

describe('useFormState', () => {
  const fields = [
    { name: 'email', defaultValue: '', required: true },
    { name: 'age', defaultValue: 0 },
  ]

  it('initialises with default values', () => {
    const { result } = renderHook(() => useFormState(fields))
    expect(result.current.values.email).toBe('')
    expect(result.current.values.age).toBe(0)
  })

  it('respects passed initialValues over defaults', () => {
    const { result } = renderHook(() => useFormState(fields, { email: 'a@b.com' }))
    expect(result.current.values.email).toBe('a@b.com')
  })

  it('setValue updates a specific field', () => {
    const { result } = renderHook(() => useFormState(fields))
    act(() => { result.current.setValue('email', 'test@test.com') })
    expect(result.current.values.email).toBe('test@test.com')
    expect(result.current.isDirty).toBe(true)
  })

  it('validates required fields', () => {
    const { result } = renderHook(() => useFormState(fields))
    act(() => { result.current.setValue('email', '') })
    expect(result.current.errors.email).toBe('This field is required')
    expect(result.current.isValid).toBe(false)
  })

  it('clears error when required field gets a value', () => {
    const { result } = renderHook(() => useFormState(fields))
    act(() => { result.current.setValue('email', '') })
    act(() => { result.current.setValue('email', 'filled@test.com') })
    expect(result.current.errors.email).toBeUndefined()
    expect(result.current.isValid).toBe(true)
  })

  it('calls custom validate function', () => {
    const customFields = [
      {
        name: 'score',
        defaultValue: 0,
        validate: (v: number) => (v < 0 ? 'Must be non-negative' : null),
      },
    ]
    const { result } = renderHook(() => useFormState(customFields))
    act(() => { result.current.setValue('score', -1) })
    expect(result.current.errors.score).toBe('Must be non-negative')
  })

  it('setTouched marks field as touched', () => {
    const { result } = renderHook(() => useFormState(fields))
    act(() => { result.current.setTouched('email') })
    expect(result.current.touched.email).toBe(true)
  })

  it('reset restores initial state', () => {
    const { result } = renderHook(() => useFormState(fields))
    act(() => { result.current.setValue('email', 'changed@test.com') })
    act(() => { result.current.reset() })
    expect(result.current.values.email).toBe('')
    expect(result.current.isDirty).toBe(false)
  })

  it('setValues sets multiple values at once', () => {
    const { result } = renderHook(() => useFormState(fields))
    act(() => { result.current.setValues({ email: 'bulk@test.com', age: 25 }) })
    expect(result.current.values.email).toBe('bulk@test.com')
    expect(result.current.values.age).toBe(25)
    expect(result.current.isDirty).toBe(true)
  })

  it('validateAll returns false and populates errors when invalid', () => {
    const { result } = renderHook(() => useFormState(fields))
    let isValid: boolean
    act(() => { isValid = result.current.validateAll() })
    expect(isValid!).toBe(false)
    expect(result.current.errors.email).toBeDefined()
  })

  it('validateAll returns true when all fields valid', () => {
    const { result } = renderHook(() => useFormState(fields))
    act(() => { result.current.setValue('email', 'valid@example.com') })
    let isValid: boolean
    act(() => { isValid = result.current.validateAll() })
    expect(isValid!).toBe(true)
  })
})
