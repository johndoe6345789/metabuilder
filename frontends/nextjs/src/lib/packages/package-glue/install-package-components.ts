import { getPackageComponents } from './get-package-components'
import type { PackageDefinition } from './types'

// Install package components into database
export async function installPackageComponents(pkg: PackageDefinition, db: any): Promise<void> {
  const components = getPackageComponents(pkg)

  for (const component of components) {
    await db.set('components', component.id, component)
  }
}
