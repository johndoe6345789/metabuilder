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

export function readTreeTenant(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return window.localStorage.getItem(TREE_TENANT_KEY) ?? undefined
}

export function writeTreeTenant(tenant: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TREE_TENANT_KEY, tenant)
}

/**
 * Whether the stored tree belongs to someone else.
 *
 * An unmarked tree counts as ours: every install predating this marker has
 * one, and blanking it would destroy a real draft to close a window that
 * writing the marker on this same mount already closes for every switch
 * after it.
 */
export function treeBelongsToAnother(tenant: string): boolean {
  const recorded = readTreeTenant()
  return recorded !== undefined && recorded !== tenant
}
