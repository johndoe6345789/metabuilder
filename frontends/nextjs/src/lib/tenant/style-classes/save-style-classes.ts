import { sheetId } from './sheet-id'
import { buildRows } from './build-rows'
import { postBatch } from './post-batch'
import type { StyleClassShape } from './types'

/**
 * Write the class set, replacing whatever the tenant had.
 *
 * The rules and their declarations are removed by name first. Deleting the
 * StyleClass was said to cascade them away; nothing cascades -- the SQL the
 * live adapters run emits no FOREIGN KEY, and only the Prisma generator
 * reads `on_delete` -- so they all survived. Rule ids are deterministic and
 * the rows go in through _bulk/create, which refuses the whole batch on the
 * first conflicting id, so the second publish and every one after it failed:
 * the site kept serving the first version of its CSS forever, and a class
 * the founder deleted never stopped rendering.
 */
export async function saveStyleClasses(
  dbal: string,
  tenant: string,
  classes: StyleClassShape[]
): Promise<boolean> {
  const base = `${dbal}/${tenant}/core`
  const id = sheetId(tenant)

  // Children first: the ids below are deterministic, so anything left over
  // collides with what is about to be written.
  for (const entity of ['StyleRuleProp', 'StyleRule']) {
    const query = new URLSearchParams({ 'filter.styleClassId': id })
    await fetch(`${base}/${entity}?${query.toString()}`, {
      method: 'DELETE',
    }).catch(() => null)
  }
  await fetch(`${base}/StyleClass/${id}`, { method: 'DELETE' }).catch(
    () => null
  )

  const sheet = await fetch(`${base}/StyleClass`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, tenantId: tenant }),
  })
  if (!sheet.ok) return false

  const { rules, props } = buildRows(id, tenant, classes)

  if (!(await postBatch(`${base}/StyleRule/_bulk/create`, rules))) return false
  return postBatch(`${base}/StyleRuleProp/_bulk/create`, props)
}
