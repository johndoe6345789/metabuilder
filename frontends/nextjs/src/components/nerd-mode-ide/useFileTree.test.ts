import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

const store = vi.hoisted(() => ({
  god: {
    tree: { id: 'root', type: 'root', props: {}, children: [] },
    css: [{ id: 'c1', name: 'card', props: { padding: '8px' } }],
    workflows: {},
  } as Record<string, unknown>,
}))
vi.mock('@/store/hooks', () => ({
  useAppSelector: (fn: (s: unknown) => unknown) => fn({ god: store.god }),
}))
vi.mock('@/app/[tenantSlug]/panel/god/tabs/use-current-tenant-scope', () => ({
  useCurrentTenantScope: () => ({
    tenant: 'harbour',
    canPickOtherTenant: false,
  }),
}))

import { useFileTree } from './useFileTree'
import { PROJECT_FOLDER } from './project-files'

beforeEach(() => vi.clearAllMocks())

/**
 * The explorer listed three invented filenames read from a localStorage
 * key nothing writes, and opening one set `content: ''` -- so whatever
 * you clicked, the editor stayed blank. It lists what this community has
 * actually built now.
 */
describe('useFileTree', () => {
  it('lists the things this community has built', () => {
    const { result } = renderHook(() => useFileTree())
    expect(result.current.tree[0].name).toBe(PROJECT_FOLDER)
    expect(result.current.tree[0].children?.map(c => c.name)).toEqual([
      'page-tree.json',
      'styles.css',
      'workflow.json',
    ])
  })

  it('opens with that folder already showing', () => {
    const { result } = renderHook(() => useFileTree())
    expect(result.current.expandedPaths.has(PROJECT_FOLDER)).toBe(true)
    expect(result.current.openFile).toBeNull()
  })

  it('opens a file with what is actually in it', () => {
    const { result } = renderHook(() => useFileTree())

    act(() => {
      result.current.openFileNode(`${PROJECT_FOLDER}/styles.css`, 'css')
    })

    expect(result.current.openFile?.content).toContain('padding: 8px')
    expect(result.current.openFile?.language).toBe('css')
  })

  it('has nothing to open for a path it does not know', () => {
    const { result } = renderHook(() => useFileTree())
    act(() => {
      result.current.openFileNode('nowhere/x.json', 'json')
    })
    expect(result.current.openFile).toBeNull()
  })

  it('folds the folder away and back', () => {
    const { result } = renderHook(() => useFileTree())
    act(() => {
      result.current.toggleExpand(PROJECT_FOLDER)
    })
    expect(result.current.expandedPaths.has(PROJECT_FOLDER)).toBe(false)
    act(() => {
      result.current.toggleExpand(PROJECT_FOLDER)
    })
    expect(result.current.expandedPaths.has(PROJECT_FOLDER)).toBe(true)
  })
})
