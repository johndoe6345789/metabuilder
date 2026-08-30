'use client'

import type { PackageRef, RegistryPackage } from './use-package-registry'
import type { usePackageRegistry } from './use-package-registry'
import type { usePackageManagerUi } from './use-package-manager-ui'

type Registry = ReturnType<typeof usePackageRegistry>
type Ui = ReturnType<typeof usePackageManagerUi>

/**
 * The manager's writes, kept apart from the view so each one can be
 * tested against a fake registry instead of a rendered card.
 */
export function usePackageManagerActions(
  reg: Registry,
  ui: Ui,
  tenant: string
) {
  const doCreate = (): void => {
    if (!ui.newName.trim()) return
    reg.create(ui.newName)
    ui.setNewName('')
    ui.setFlash('Package created')
  }

  const saveEdit = (p: RegistryPackage): void => {
    reg.update(p.manifest.id, ui.draft)
    ui.cancelEdit()
    ui.setFlash('Saved')
  }

  const doPublish = async (p: RegistryPackage): Promise<void> => {
    const ok = await reg.publish(p.manifest.id, tenant)
    ui.setFlash(ok ? 'Published' : 'Publish failed')
  }

  // A workflow or page can be added to a package's contents only once;
  // picking an already-added item from the search is a no-op, not a
  // duplicate entry.
  const addWorkflow = (id: string, item: PackageRef): void => {
    const p = reg.packages.find(pkg => pkg.manifest.id === id)
    if (!p || p.workflows.some(w => w.id === item.id)) return
    reg.updateContents(id, { workflows: [...p.workflows, item] })
  }

  const addPageConfig = (id: string, item: PackageRef): void => {
    const p = reg.packages.find(pkg => pkg.manifest.id === id)
    if (!p || p.pageConfigs.some(pc => pc.id === item.id)) return
    reg.updateContents(id, { pageConfigs: [...p.pageConfigs, item] })
  }

  return { doCreate, saveEdit, doPublish, addWorkflow, addPageConfig }
}
