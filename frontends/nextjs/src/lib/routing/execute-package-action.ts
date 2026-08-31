import { resolveTenantId } from './resolve-tenant-id'
import { loadInstalledPackage } from './package-action/load-package'
import { resolveActionConfig } from './package-action/resolve-action-config'
import { notFoundResult } from './package-action/not-found-result'
import type { DbalOperationContext } from './dbal-operation/types'
import type {
  PackageActionOptions,
  PackageActionResult,
} from './package-action/types'

export type { PackageActionResult } from './package-action/types'

/**
 * Package actions are custom operations defined by packages. Loads the
 * package's config and confirms the requested action is registered in it.
 *
 * Note: this stops at confirming the action exists and echoing its
 * metadata -- it does not yet dynamically load and invoke the handler a
 * package config points to. Doing that safely (arbitrary handler code,
 * picked by tenant-editable config) is a real design decision -- a
 * loader allowlist, a sandbox, or both -- not something to improvise
 * while splitting this file.
 */
export async function executePackageAction(
  packageId: string,
  entity: string,
  action: string,
  id: string | undefined,
  context?: DbalOperationContext,
  options?: PackageActionOptions
): Promise<PackageActionResult> {
  try {
    const pkg = await loadInstalledPackage(packageId)
    if (pkg == null) {
      return notFoundResult(
        `Package not found or disabled: ${packageId}`,
        options?.allowFallback
      )
    }

    const { config, invalidConfigError } = resolveActionConfig(
      pkg,
      entity,
      action
    )
    if (invalidConfigError !== undefined) {
      return { success: false, error: invalidConfigError, code: 'INVALID_CONFIG' }
    }
    if (config === undefined) {
      return notFoundResult(
        `Action not found: ${entity}.${action}`,
        options?.allowFallback
      )
    }

    return {
      success: true,
      data: {
        action: `${entity}.${action}`,
        entityId: id,
        packageId,
        tenantId: resolveTenantId(context),
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Action failed',
    }
  }
}
