import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useFieldEditor } from './useFieldEditor'
import type { ModelSchema } from './schema-types'

const model: ModelSchema = {
  name: 'user',
  label: 'User',
  fields: [
    { name: 'email', type: 'string', label: 'Email' },
    { name: 'age', type: 'number', label: 'Age' },
  ],
}

describe('useFieldEditor', () => {
  it('starts seeded from the model, dialog closed', () => {
    const { result } = renderHook(() => useFieldEditor(model, vi.fn()))
    expect(result.current.name).toBe('user')
    expect(result.current.label).toBe('User')
    expect(result.current.fields).toEqual(model.fields)
    expect(result.current.dialogOpen).toBe(false)
    expect(result.current.editingField).toBeNull()
  })

  it('openAdd opens the dialog with no editing field', () => {
    const { result } = renderHook(() => useFieldEditor(model, vi.fn()))
    act(() => result.current.openAdd())
    expect(result.current.dialogOpen).toBe(true)
    expect(result.current.editingField).toBeNull()
  })

  it('openEdit opens the dialog with the given field', () => {
    const { result } = renderHook(() => useFieldEditor(model, vi.fn()))
    act(() => result.current.openEdit(model.fields[0]))
    expect(result.current.dialogOpen).toBe(true)
    expect(result.current.editingField).toEqual(model.fields[0])
  })

  it('closeDialog closes it', () => {
    const { result } = renderHook(() => useFieldEditor(model, vi.fn()))
    act(() => result.current.openAdd())
    act(() => result.current.closeDialog())
    expect(result.current.dialogOpen).toBe(false)
  })

  it('saveField appends a new field when nothing is being edited', () => {
    const { result } = renderHook(() => useFieldEditor(model, vi.fn()))
    const created = { name: 'bio', type: 'string', label: 'Bio' }
    act(() => result.current.saveField(created))
    expect(result.current.fields).toHaveLength(3)
    expect(result.current.fields[2]).toEqual(created)
    expect(result.current.dialogOpen).toBe(false)
  })

  it('saveField replaces the field being edited', () => {
    const { result } = renderHook(() => useFieldEditor(model, vi.fn()))
    act(() => result.current.openEdit(model.fields[0]))
    const renamed = { name: 'email', type: 'string', label: 'Email address' }
    act(() => result.current.saveField(renamed))
    expect(result.current.fields).toHaveLength(2)
    expect(result.current.fields[0]).toEqual(renamed)
  })

  it('deleteField removes only the named field', () => {
    const { result } = renderHook(() => useFieldEditor(model, vi.fn()))
    act(() => result.current.deleteField('age'))
    expect(result.current.fields.map(f => f.name)).toEqual(['email'])
  })

  it('save reports the current name/label/fields via onSave', () => {
    const onSave = vi.fn()
    const { result } = renderHook(() => useFieldEditor(model, onSave))
    act(() => result.current.setName('account'))
    act(() => result.current.save())
    expect(onSave).toHaveBeenCalledWith({
      ...model,
      name: 'account',
      label: 'User',
      fields: model.fields,
    })
  })
})
