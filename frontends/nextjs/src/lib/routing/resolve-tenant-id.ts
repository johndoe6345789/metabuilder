/** The tenant id from context, however it got there -- a direct
 *  `tenantId`, or a `tenant.id` from a resolved tenant record. */
export function resolveTenantId(context?: {
  tenantId?: string
  tenant?: { id?: string | null }
}): string | undefined {
  if (typeof context?.tenantId === 'string' && context.tenantId.length > 0) {
    return context.tenantId
  }

  const tenantId = context?.tenant?.id
  if (typeof tenantId === 'string' && tenantId.length > 0) {
    return tenantId
  }

  return undefined
}
