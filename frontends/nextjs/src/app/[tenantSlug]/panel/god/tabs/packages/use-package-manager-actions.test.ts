import { describe, expect, it, vi } from 'vitest'

import { usePackageManagerActions } from './use-package-manager-actions'
import type { PackageRef, RegistryPackage } from './use-package-registry'

const pkg = (over: Partial<RegistryPackage> = {}): RegistryPackage =>
  ({
    manifest: {
      id: 'p1',
      name: 'Pkg',
      version: '1.0.0',
      description: '',
      category: 'other',
      icon: 'widgets',
    },
    workflows: [],
    pageConfigs: [],
    themeId: null,
    publishedId: null,
    archived: false,
    ...over,
  }) as unknown as RegistryPackage

const reg = () => ({
  packages: [pkg()],
  publishing: null,
  create: vi.fn(),
  update: vi.fn(),
  publish: vi.fn(async () => true),
  updateContents: vi.fn(),
  setArchived: vi.fn(),
  duplicate: vi.fn(),
  remove: vi.fn(),
})

const ui = () => ({
  newName: '',
  setNewName: vi.fn(),
  setFlash: vi.fn(),
  showArchived: false,
  setShowArchived: vi.fn(),
  editingId: null,
  draft: { name: '', description: '', category: 'other', icon: 'widgets' },
  patchDraft: vi.fn(),
  beginEdit: vi.fn(),
  cancelEdit: vi.fn(),
})

describe('doCreate', () => {
  it('creates from the trimmed name and clears the field', () => {
    const r = reg()
    const u = { ...ui(), newName: '  New Pkg  ' }
    usePackageManagerActions(r, u, 'acme').doCreate()
    expect(r.create).toHaveBeenCalledWith('  New Pkg  ')
    expect(u.setNewName).toHaveBeenCalledWith('')
    expect(u.setFlash).toHaveBeenCalledWith('Package created')
  })

  it.each(['', '   '])('does nothing for the blank name %p', name => {
    const r = reg()
    const u = { ...ui(), newName: name }
    usePackageManagerActions(r, u, 'acme').doCreate()
    expect(r.create).not.toHaveBeenCalled()
  })
})

describe('saveEdit', () => {
  it('writes the draft and exits editing', () => {
    const r = reg()
    const u = ui()
    usePackageManagerActions(r, u, 'acme').saveEdit(pkg())
    expect(r.update).toHaveBeenCalledWith('p1', u.draft)
    expect(u.cancelEdit).toHaveBeenCalledOnce()
    expect(u.setFlash).toHaveBeenCalledWith('Saved')
  })
})

describe('doPublish', () => {
  it('reports success', async () => {
    const r = reg()
    const u = ui()
    await usePackageManagerActions(r, u, 'acme').doPublish(pkg())
    expect(r.publish).toHaveBeenCalledWith('p1', 'acme')
    expect(u.setFlash).toHaveBeenCalledWith('Published')
  })

  it('reports failure', async () => {
    const r = { ...reg(), publish: vi.fn(async () => false) }
    const u = ui()
    await usePackageManagerActions(r, u, 'acme').doPublish(pkg())
    expect(u.setFlash).toHaveBeenCalledWith('Publish failed')
  })
})

const item = (id = 'w1'): PackageRef => ({ id, kind: 'workflow' }) as PackageRef

describe('addWorkflow', () => {
  it('appends to the named package', () => {
    const r = reg()
    usePackageManagerActions(r, ui(), 'acme').addWorkflow('p1', item())
    expect(r.updateContents).toHaveBeenCalledWith('p1', {
      workflows: [item()],
    })
  })

  // Picking an already-added item from the search must not duplicate it.
  it('does nothing when the workflow is already in the package', () => {
    const r = { ...reg(), packages: [pkg({ workflows: [item()] })] }
    usePackageManagerActions(r, ui(), 'acme').addWorkflow('p1', item())
    expect(r.updateContents).not.toHaveBeenCalled()
  })

  it('does nothing for a package that does not exist', () => {
    const r = reg()
    usePackageManagerActions(r, ui(), 'acme').addWorkflow('ghost', item())
    expect(r.updateContents).not.toHaveBeenCalled()
  })
})

describe('addPageConfig', () => {
  it('appends to the named package', () => {
    const r = reg()
    usePackageManagerActions(r, ui(), 'acme').addPageConfig('p1', item('c1'))
    expect(r.updateContents).toHaveBeenCalledWith('p1', {
      pageConfigs: [item('c1')],
    })
  })

  it('does nothing when the page is already in the package', () => {
    const r = { ...reg(), packages: [pkg({ pageConfigs: [item('c1')] })] }
    usePackageManagerActions(r, ui(), 'acme').addPageConfig('p1', item('c1'))
    expect(r.updateContents).not.toHaveBeenCalled()
  })
})
