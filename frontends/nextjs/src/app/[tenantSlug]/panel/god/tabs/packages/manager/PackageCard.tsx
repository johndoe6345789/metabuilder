'use client'

import type { PackageRef, RegistryPackage } from '../use-package-registry'
import type { EditDraft } from '../use-package-manager-ui'
import { PackageCardActions } from './PackageCardActions'
import { PackageContentsSection } from './PackageContentsSection'
import { PackageEditForm } from './PackageEditForm'
import { PackageHeader } from './PackageHeader'
import s from '../PackageManager.module.scss'

export interface PackageCardProps {
  tenant: string
  p: RegistryPackage
  editing: boolean
  draft: EditDraft
  publishing: string | null
  onPatchDraft: (patch: Partial<EditDraft>) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onBeginEdit: () => void
  onPublish: () => void
  onArchiveToggle: () => void
  onDuplicate: () => void
  onDelete: () => void
  onAddWorkflow: (id: string, item: PackageRef) => void
  onAddPageConfig: (id: string, item: PackageRef) => void
  onReorderWorkflows: (list: PackageRef[]) => void
  onReorderPages: (list: PackageRef[]) => void
  onRemoveWorkflow: (id: string) => void
  onRemovePage: (id: string) => void
  onToggleTheme: () => void
}

/** One package, in either its editing or its viewing form. */
export function PackageCard(props: PackageCardProps) {
  if (props.editing) {
    return (
      <div className={s.card}>
        <PackageEditForm
          draft={props.draft}
          onPatch={props.onPatchDraft}
          onSave={props.onSaveEdit}
          onCancel={props.onCancelEdit}
        />
      </div>
    )
  }

  return (
    <div className={s.card}>
      <PackageHeader p={props.p} />
      <PackageContentsSection
        tenant={props.tenant}
        p={props.p}
        onAddWorkflow={props.onAddWorkflow}
        onAddPageConfig={props.onAddPageConfig}
        onReorderWorkflows={props.onReorderWorkflows}
        onReorderPages={props.onReorderPages}
        onRemoveWorkflow={props.onRemoveWorkflow}
        onRemovePage={props.onRemovePage}
        onToggleTheme={props.onToggleTheme}
      />
      <PackageCardActions
        p={props.p}
        publishing={props.publishing}
        onPublish={props.onPublish}
        onEdit={props.onBeginEdit}
        onArchiveToggle={props.onArchiveToggle}
        onDuplicate={props.onDuplicate}
        onDelete={props.onDelete}
      />
    </div>
  )
}
