import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

const dropdownConfigs = vi.hoisted(() => ({
  useDropdownConfigs: vi.fn(),
}))
const smtpConfig = vi.hoisted(() => ({ useSmtpConfig: vi.fn(() => ({})) }))

vi.mock('./use-dropdown-configs', () => dropdownConfigs)
vi.mock('./use-smtp-config', () => smtpConfig)

import { useConfigTab } from './use-config-tab'

const configs = [
  { id: 'c1', name: 'Colors', options: [] },
  { id: 'c2', name: 'Sizes', options: [] },
]

function mockDd(overrides?: Partial<ReturnType<typeof baseDd>>) {
  dropdownConfigs.useDropdownConfigs.mockReturnValue({
    ...baseDd(),
    ...overrides,
  })
}

function baseDd() {
  return {
    configs,
    create: vi.fn(() => 'new-id'),
    addOption: vi.fn(),
  }
}

describe('useConfigTab', () => {
  it('selects the first config when nothing is explicitly selected', () => {
    mockDd()
    const { result } = renderHook(() => useConfigTab())
    expect(result.current.selected?.id).toBe('c1')
  })

  it('selects the matching config once one is chosen', () => {
    mockDd()
    const { result } = renderHook(() => useConfigTab())
    act(() => result.current.ui.setSelectedId('c2'))
    expect(result.current.selected?.id).toBe('c2')
  })

  it('has no selection when there are no configs', () => {
    mockDd({ configs: [] })
    const { result } = renderHook(() => useConfigTab())
    expect(result.current.selected).toBeUndefined()
  })

  it('addList creates a list and selects it, then clears the draft name', () => {
    const create = vi.fn(() => 'brand-new')
    mockDd({ create })
    const { result } = renderHook(() => useConfigTab())

    act(() => result.current.ui.setNewListName('  My List  '))
    act(() => result.current.addList())

    expect(create).toHaveBeenCalledWith('  My List  ')
    expect(result.current.ui.selectedId).toBe('brand-new')
    expect(result.current.ui.newListName).toBe('')
  })

  it('addList does nothing for a blank name', () => {
    const create = vi.fn()
    mockDd({ create })
    const { result } = renderHook(() => useConfigTab())

    act(() => result.current.ui.setNewListName('   '))
    act(() => result.current.addList())

    expect(create).not.toHaveBeenCalled()
  })

  it('addOpt adds an option using the label as the value when none is given', () => {
    const addOption = vi.fn()
    mockDd({ addOption })
    const { result } = renderHook(() => useConfigTab())

    act(() => result.current.ui.setOptLabel('Red'))
    act(() => result.current.addOpt())

    expect(addOption).toHaveBeenCalledWith('c1', {
      label: 'Red',
      value: 'Red',
    })
    expect(result.current.ui.optLabel).toBe('')
  })

  it('addOpt uses an explicit value when one is given', () => {
    const addOption = vi.fn()
    mockDd({ addOption })
    const { result } = renderHook(() => useConfigTab())

    act(() => result.current.ui.setOptLabel('Red'))
    act(() => result.current.ui.setOptValue('#f00'))
    act(() => result.current.addOpt())

    expect(addOption).toHaveBeenCalledWith('c1', {
      label: 'Red',
      value: '#f00',
    })
  })

  it('addOpt does nothing without a label', () => {
    const addOption = vi.fn()
    mockDd({ addOption })
    const { result } = renderHook(() => useConfigTab())

    act(() => result.current.addOpt())

    expect(addOption).not.toHaveBeenCalled()
  })

  it('addOpt does nothing when nothing is selected', () => {
    const addOption = vi.fn()
    mockDd({ configs: [], addOption })
    const { result } = renderHook(() => useConfigTab())

    act(() => result.current.ui.setOptLabel('Red'))
    act(() => result.current.addOpt())

    expect(addOption).not.toHaveBeenCalled()
  })
})
