'use client'

import { Typography } from '@/m3'
import { usePackageManagerActions } from './use-package-manager-actions'
import { usePackageManagerUi } from './use-package-manager-ui'
import { usePackageRegistry } from './use-package-registry'
import { PackageGrid } from './manager/PackageGrid'
import { PackageManagerToolbar } from './manager/PackageManagerToolbar'
import s from './PackageManager.module.scss'

export function PackageManager({ tenant }: { tenant: string }) {
  const reg = usePackageRegistry()
  const ui = usePackageManagerUi()
  const actions = usePackageManagerActions(reg, ui, tenant)

  const visible = reg.packages.filter(p => p.archived === ui.showArchived)

  return (
    <div className={s.root}>
      <PackageManagerToolbar
        newName={ui.newName}
        showArchived={ui.showArchived}
        onNewNameChange={ui.setNewName}
        onCreate={actions.doCreate}
        onToggleArchived={() => {
          ui.setShowArchived(!ui.showArchived)
        }}
      />

      {ui.flash && <div className={s.flash}>{ui.flash}</div>}
      {visible.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          {ui.showArchived
            ? 'No archived packages.'
            : 'No packages yet — create one to bundle routes, component ' +
              'trees and workflows.'}
        </Typography>
      )}

      <div className={s.grid}>
        <PackageGrid
          tenant={tenant}
          packages={visible}
          reg={reg}
          ui={ui}
          actions={actions}
        />
      </div>
    </div>
  )
}
