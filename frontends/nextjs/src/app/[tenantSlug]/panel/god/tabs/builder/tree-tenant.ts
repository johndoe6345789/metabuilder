/**
 * Which tenant the draft tree in the store belongs to.
 *
 * The tree persists in IndexedDB keyed by browser origin, not by tenant, so
 * nothing in the stored value says whose it is. This marker says it, and it
 * lives outside React state because the case that matters is a full page
 * reload: signing into another tenant goes through the SSO redirect, so any
 * in-memory answer is reconstructed from scratch and agrees with whatever
 * is signed in now -- which is exactly the wrong answer.
 */
export const TREE_TENANT_KEY = 'metabuilder:builder-last-tenant'

/**
 * Reading storage can throw, not just return null: Safari in private mode
 * and any browser with site data blocked raise on access. This guard runs
 * on every render of the builder, so a throw here would take the whole
 * panel down -- it fails open (the tree is treated as ours) rather than
 * failing loudly, because refusing to show someone their own work is a
 * worse answer than not policing a tenant switch they may never make.
 */
export function readTreeTenant(): string | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    return window.localStorage.getItem(TREE_TENANT_KEY) ?? undefined
  } catch {
    return undefined
  }
}

export function writeTreeTenant(tenant: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(TREE_TENANT_KEY, tenant)
  } catch {
    // Nothing to do: without storage there is no marker to compare against
    // next time, and readTreeTenant already treats that as "ours".
  }
}

/**
 * Whether the stored tree belongs to someone else.
 *
 * `known` is false while auth is still resolving or nobody is signed in.
 * That matters because normalizeTenantId(undefined) answers "system", so
 * without this every tenant's tree looks foreign for the render before
 * auth lands -- and blanking on that would destroy a real draft on every
 * page load, which is a far more common event than a tenant switch.
 *
 * An unmarked tree counts as ours: every install predating this marker has
 * one, and blanking it would destroy a real draft to close a window that
 * writing the marker on this same mount already closes.
 */
export function treeBelongsToAnother(tenant: string, known: boolean): boolean {
  if (!known) return false
  const recorded = readTreeTenant()
  return recorded !== undefined && recorded !== tenant
}
