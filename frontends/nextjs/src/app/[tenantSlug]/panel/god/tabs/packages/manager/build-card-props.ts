import type { usePackageManagerActions } from '../use-package-manager-actions'
import type { usePackageManagerUi } from '../use-package-manager-ui'
import type { usePackageRegistry, RegistryPackage } from '../use-package-registry'
import type { PackageCardProps } from './PackageCard'

type Registry = ReturnType<typeof usePackageRegistry>
type Ui = ReturnType<typeof usePackageManagerUi>
type Actions = ReturnType<typeof usePackageManagerActions>

/** Wires one package's card to the registry, the UI state and the actions. */
export function buildCardProps(
  tenant: string,
  p: RegistryPackage,
  reg: Registry,
  ui: Ui,
  actions: Actions
): PackageCardProps {
  return {
    tenant,
    p,
    editing: ui.editingId === p.manifest.id,
    draft: ui.draft,
    publishing: reg.publishing,
    onPatchDraft: ui.patchDraft,
    onSaveEdit: () => {
      actions.saveEdit(p)
    },
    onCancelEdit: ui.cancelEdit,
    onBeginEdit: () => {
      ui.beginEdit(p.manifest.id, {
        name: p.manifest.name,
        description: p.manifest.description,
        category: p.manifest.category,
        icon: p.manifest.icon,
      })
    },
    onPublish: () => {
      void actions.doPublish(p)
    },
    onArchiveToggle: () => {
      reg.setArchived(p.manifest.id, !p.archived)
    },
    onDuplicate: () => {
      reg.duplicate(p.manifest.id)
    },
    onDelete: () => {
      reg.remove(p.manifest.id)
    },
    onAddWorkflow: actions.addWorkflow,
    onAddPageConfig: actions.addPageConfig,
    onReorderWorkflows: list => {
      reg.updateContents(p.manifest.id, { workflows: list })
    },
    onReorderPages: list => {
      reg.updateContents(p.manifest.id, { pageConfigs: list })
    },
    onRemoveWorkflow: id => {
      reg.updateContents(p.manifest.id, {
        workflows: p.workflows.filter(w => w.id !== id),
      })
    },
    onRemovePage: id => {
      reg.updateContents(p.manifest.id, {
        pageConfigs: p.pageConfigs.filter(pc => pc.id !== id),
      })
    },
    onToggleTheme: () => {
      reg.updateContents(p.manifest.id, {
        themeId: p.themeId != null ? null : tenant,
      })
    },
  }
}
