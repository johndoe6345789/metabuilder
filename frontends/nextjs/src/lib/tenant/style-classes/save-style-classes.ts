import { sheetId } from './sheet-id'
import { buildRows } from './build-rows'
import { postBatch } from './post-batch'
import type { StyleClassShape } from './types'

/**
 * Write the class set, replacing whatever the tenant had.
 *
 * Deleting the StyleClass cascades its rules and their declarations away, so
 * a republish replaces the sheet rather than merging into it.
 */
export async function saveStyleClasses(
  dbal: string,
  tenant: string,
  classes: StyleClassShape[]
): Promise<boolean> {
  const base = `${dbal}/${tenant}/core`
  const id = sheetId(tenant)

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
