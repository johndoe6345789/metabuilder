'use client'

import type { usePackageManagerActions } from '../use-package-manager-actions'
import type { usePackageManagerUi } from '../use-package-manager-ui'
import type { usePackageRegistry } from '../use-package-registry'
import { buildCardProps } from './build-card-props'
import { PackageCard } from './PackageCard'

type Registry = ReturnType<typeof usePackageRegistry>
type Ui = ReturnType<typeof usePackageManagerUi>
type Actions = ReturnType<typeof usePackageManagerActions>

export interface PackageGridProps {
  tenant: string
  packages: Registry['packages']
  reg: Registry
  ui: Ui
  actions: Actions
}

/** One card per visible package, wired to the registry and the UI state. */
export function PackageGrid(props: PackageGridProps) {
  return (
    <>
      {props.packages.map(p => (
        <PackageCard
          key={p.manifest.id}
          {...buildCardProps(
            props.tenant,
            p,
            props.reg,
            props.ui,
            props.actions
          )}
        />
      ))}
    </>
  )
}
