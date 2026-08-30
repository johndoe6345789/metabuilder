/** Building a TenantContextValue from a tenant and its packages. */

import { getPrefixedEntity, getTableName } from '@/lib/routing/route-parser'
import type { PackageInfo, TenantContextValue } from './tenant-context-types'

/** The primary package plus its dependencies, with duplicates dropped. */
export function combinePackages(
  packageId: string,
  additionalPackages: PackageInfo[]
): PackageInfo[] {
  const all = [{ id: packageId }, ...additionalPackages]
  return all.filter(
    (pkg, index) => all.findIndex(p => p.id === pkg.id) === index
  )
}

export function buildTenantContextValue(
  tenant: string,
  packageId: string,
  packages: PackageInfo[]
): TenantContextValue {
  return {
    tenant,
    primaryPackage: packageId,
    packages,
    packageId,

    getPrefixedEntity: entity => getPrefixedEntity(entity, packageId),
    getTableName: entity => getTableName(entity, packageId),

    buildApiUrl: (entity, id, action, pkg) => {
      const targetPkg = pkg ?? packageId
      let url = `/api/v1/${tenant}/${targetPkg}/${entity}`
      if (id !== undefined) url += `/${id}`
      if (action !== undefined) url += `/${action}`
      return url
    },

    hasPackage: pkgId => packages.some(p => p.id === pkgId),

    getPrefixedEntityForPackage: (pkgId, entity) =>
      getPrefixedEntity(entity, pkgId),
  }
}
