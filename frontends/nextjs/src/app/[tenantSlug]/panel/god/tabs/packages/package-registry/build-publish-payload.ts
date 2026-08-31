import type { RegistryPackage } from './types'

/** The GodPackage entity fields a publish POST/PUT sends. sortOrder/
 *  isPublished are included explicitly rather than relying on the
 *  schema's defaults -- matching what PageConfig and InstalledPackage's
 *  schemas required earlier, GodPackage's validator rejects a request
 *  missing either even though both carry a default. */
export function buildPublishPayload(pkg: RegistryPackage, tenant: string) {
  return {
    name: pkg.manifest.name,
    description:
      pkg.manifest.description.length > 0 ? pkg.manifest.description : null,
    category: pkg.manifest.category,
    icon: pkg.manifest.icon,
    workflowIds: JSON.stringify(pkg.workflows.map(w => w.id)),
    pageConfigIds: JSON.stringify(pkg.pageConfigs.map(pc => pc.id)),
    themeId: pkg.themeId,
    version: pkg.manifest.version,
    tenantId: tenant,
    sortOrder: 0,
    isPublished: true,
    updatedAt: Date.now(),
  }
}
