import { describe, expect, it, vi } from 'vitest'
import { buildCardProps } from './build-card-props'
import type { RegistryPackage } from '../use-package-registry'

const pkg: RegistryPackage = {
  manifest: {
    id: 'pkg1',
    name: 'Blog',
    version: '1.0.0',
    description: 'A blog',
    author: 'me',
    category: 'content',
    icon: 'B',
    screenshots: [],
  } as RegistryPackage['manifest'],
  content: {} as RegistryPackage['content'],
  archived: false,
  workflows: [
    { id: 'w1', label: 'W1' },
    { id: 'w2', label: 'W2' },
  ],
  pageConfigs: [{ id: 'p1', label: 'P1' }],
  themeId: null,
  publishedId: null,
}

function fakeDeps() {
  const reg = {
    publishing: false,
    setArchived: vi.fn(),
    duplicate: vi.fn(),
    remove: vi.fn(),
    updateContents: vi.fn(),
  } as unknown as Parameters<typeof buildCardProps>[2]
  const ui = {
    editingId: null,
    draft: {},
    patchDraft: vi.fn(),
    cancelEdit: vi.fn(),
    beginEdit: vi.fn(),
  } as unknown as Parameters<typeof buildCardProps>[3]
  const actions = {
    saveEdit: vi.fn(),
    doPublish: vi.fn().mockResolvedValue(undefined),
    addWorkflow: vi.fn(),
    addPageConfig: vi.fn(),
  } as unknown as Parameters<typeof buildCardProps>[4]
  return { reg, ui, actions }
}

describe('buildCardProps', () => {
  it('marks editing true only when editingId matches this package', () => {
    const { reg, ui, actions } = fakeDeps()
    const editingUi = { ...ui, editingId: 'pkg1' } as typeof ui
    expect(buildCardProps('acme', pkg, reg, editingUi, actions).editing).toBe(
      true
    )
    expect(buildCardProps('acme', pkg, reg, ui, actions).editing).toBe(false)
  })

  it('onSaveEdit calls actions.saveEdit with this package', () => {
    const { reg, ui, actions } = fakeDeps()
    buildCardProps('acme', pkg, reg, ui, actions).onSaveEdit()
    expect(actions.saveEdit).toHaveBeenCalledWith(pkg)
  })

  it('onBeginEdit seeds the draft from the manifest', () => {
    const { reg, ui, actions } = fakeDeps()
    buildCardProps('acme', pkg, reg, ui, actions).onBeginEdit()
    expect(ui.beginEdit).toHaveBeenCalledWith('pkg1', {
      name: 'Blog',
      description: 'A blog',
      category: 'content',
      icon: 'B',
    })
  })

  it('onPublish calls actions.doPublish with this package', () => {
    const { reg, ui, actions } = fakeDeps()
    buildCardProps('acme', pkg, reg, ui, actions).onPublish()
    expect(actions.doPublish).toHaveBeenCalledWith(pkg)
  })

  it('onArchiveToggle flips the current archived state', () => {
    const { reg, ui, actions } = fakeDeps()
    buildCardProps('acme', pkg, reg, ui, actions).onArchiveToggle()
    expect(reg.setArchived).toHaveBeenCalledWith('pkg1', true)
  })

  it('onDuplicate/onDelete target this package', () => {
    const { reg, ui, actions } = fakeDeps()
    const props = buildCardProps('acme', pkg, reg, ui, actions)
    props.onDuplicate()
    props.onDelete()
    expect(reg.duplicate).toHaveBeenCalledWith('pkg1')
    expect(reg.remove).toHaveBeenCalledWith('pkg1')
  })

  it('onReorderWorkflows/onReorderPages replace the given list', () => {
    const { reg, ui, actions } = fakeDeps()
    const props = buildCardProps('acme', pkg, reg, ui, actions)
    props.onReorderWorkflows([{ id: 'w2', label: 'W2' }])
    expect(reg.updateContents).toHaveBeenCalledWith('pkg1', {
      workflows: [{ id: 'w2', label: 'W2' }],
    })
    props.onReorderPages([{ id: 'p1', label: 'P1' }])
    expect(reg.updateContents).toHaveBeenCalledWith('pkg1', {
      pageConfigs: [{ id: 'p1', label: 'P1' }],
    })
  })

  it('onRemoveWorkflow/onRemovePage filter the removed id out', () => {
    const { reg, ui, actions } = fakeDeps()
    const props = buildCardProps('acme', pkg, reg, ui, actions)
    props.onRemoveWorkflow('w1')
    expect(reg.updateContents).toHaveBeenCalledWith('pkg1', {
      workflows: [{ id: 'w2', label: 'W2' }],
    })
    props.onRemovePage('p1')
    expect(reg.updateContents).toHaveBeenCalledWith('pkg1', {
      pageConfigs: [],
    })
  })

  it('onToggleTheme sets the tenant when unset, and clears it when set', () => {
    const { reg, ui, actions } = fakeDeps()
    buildCardProps('acme', pkg, reg, ui, actions).onToggleTheme()
    expect(reg.updateContents).toHaveBeenCalledWith('pkg1', {
      themeId: 'acme',
    })

    const themed = { ...pkg, themeId: 'acme' }
    buildCardProps('acme', themed, reg, ui, actions).onToggleTheme()
    expect(reg.updateContents).toHaveBeenCalledWith('pkg1', { themeId: null })
  })
})
