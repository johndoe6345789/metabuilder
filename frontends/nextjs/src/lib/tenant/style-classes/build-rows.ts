import { safe } from './sheet-id'
import type { StyleClassShape } from './types'

/**
 * Flattens the class shapes into rule/prop rows ready to POST.
 *
 * Ids are built here rather than read back from a response, the way
 * saveTree supplies its own for PageTreeNode. A deterministic id also
 * makes a republish idempotent.
 */
export function buildRows(
  sheetId: string,
  tenant: string,
  classes: StyleClassShape[]
) {
  const rules = classes.map((css, index) => ({
    id: `${sheetId}__${safe(css.id)}`,
    tenantId: tenant,
    styleClassId: sheetId,
    ruleKey: css.id,
    name: css.name,
    sortOrder: index,
  }))
  const props = classes.flatMap((css, index) =>
    Object.entries(css.props).map(([name, value]) => ({
      id: `${rules[index]?.id ?? sheetId}__${safe(name)}`,
      tenantId: tenant,
      ruleId: rules[index]?.id ?? sheetId,
      styleClassId: sheetId,
      name,
      value,
    }))
  )
  return { rules, props }
}
