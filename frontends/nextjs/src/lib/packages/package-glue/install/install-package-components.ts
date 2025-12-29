import { getPackageComponents } from './get-package-components'
import type { PackageComponent, PackageDefinition } from './types'

type PackageComponentStore = {
  set(table: 'components', id: string, value: PackageComponent): Promise<void>
}

// Install package components into database
export async function installPackageComponents(
  pkg: PackageDefinition,
  db: PackageComponentStore
): Promise<void> {
  const components = getPackageComponents(pkg)

  for (const component of components) {
    await db.set('components', component.id, component)
  }
}
