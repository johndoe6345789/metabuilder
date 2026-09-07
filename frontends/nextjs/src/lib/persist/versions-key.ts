import { normalizeTenantId } from '@/lib/tenant/workspace-paths'

/**
 * Where one community's version history lives.
 *
 * Snapshots go to IndexedDB, which is scoped to the origin and nothing
 * finer, and the key used to be the bare string 'god.workflow'. So tenant
 * A published a workflow, tenant B signed in on the same browser, opened
 * History -- and saw A's workflow names and timestamps, one click from
 * loading A's whole graph into their editor and publishing it as theirs.
 *
 * resetTenantOwned clears the Redux slice when the tenant changes but
 * cannot reach IndexedDB, so the guard belongs in the key. Writer and
 * reader both derive it here rather than spelling it out, because the last
 * two bugs of this shape were a writer and a reader disagreeing.
 */
export function versionsKey(name: string, tenant: string): string {
  return `${name}.${normalizeTenantId(tenant)}`
}
