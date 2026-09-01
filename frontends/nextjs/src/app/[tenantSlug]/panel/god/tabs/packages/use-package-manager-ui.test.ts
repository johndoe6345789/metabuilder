import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { usePackageManagerUi } from './use-package-manager-ui'

describe('usePackageManagerUi', () => {
  it('starts with an empty draft and nothing being edited', () => {
    const { result } = renderHook(() => usePackageManagerUi())
    expect(result.current.editingId).toBeNull()
    expect(result.current.draft).toEqual({
      name: '',
      description: '',
      category: 'other',
      icon: 'deployed_code',
    })
    expect(result.current.showArchived).toBe(false)
    expect(result.current.flash).toBeNull()
  })

  it('beginEdit sets editingId and seeds the draft', () => {
    const { result } = renderHook(() => usePackageManagerUi())
    const seed = {
      name: 'Blog',
      description: 'A blog',
      category: 'content' as const,
      icon: 'B',
    }

    act(() => result.current.beginEdit('pkg1', seed))

    expect(result.current.editingId).toBe('pkg1')
    expect(result.current.draft).toEqual(seed)
  })

  it('cancelEdit clears editingId without touching the draft', () => {
    const { result } = renderHook(() => usePackageManagerUi())
    const seed = {
      name: 'Blog',
      description: '',
      category: 'other' as const,
      icon: 'B',
    }
    act(() => result.current.beginEdit('pkg1', seed))

    act(() => result.current.cancelEdit())

    expect(result.current.editingId).toBeNull()
    expect(result.current.draft).toEqual(seed)
  })

  it('patchDraft merges into the existing draft', () => {
    const { result } = renderHook(() => usePackageManagerUi())
    act(() => result.current.patchDraft({ name: 'New name' }))
    expect(result.current.draft.name).toBe('New name')
    expect(result.current.draft.category).toBe('other')
  })

  it('setNewName/setShowArchived/setFlash update their own state', () => {
    const { result } = renderHook(() => usePackageManagerUi())
    act(() => {
      result.current.setNewName('widgets')
      result.current.setShowArchived(true)
      result.current.setFlash('Saved')
    })
    expect(result.current.newName).toBe('widgets')
    expect(result.current.showArchived).toBe(true)
    expect(result.current.flash).toBe('Saved')
  })
})
