/**
 * Read and write a tenant's named CSS classes as rows.
 *
 * A style sheet is StyleClass (identity) + StyleRule (one named class) +
 * StyleRuleProp (one declaration). The Styles tab used to POST the whole set
 * as a `classes` JSON string on StyleClass; that column no longer exists, so
 * this replaces it with the same relational shape the page trees use.
 */

export interface StyleClassShape {
  id: string
  name: string
  props: Record<string, string>
}

interface RuleRow {
  id: string
  ruleKey: string
  name: string
  sortOrder: number
}

interface PropRow {
  ruleId: string
  name: string
  value: string | null
}

function rowsOf(payload: unknown): Record<string, unknown>[] {
  const data = (payload as { data?: { data?: unknown } } | null)?.data?.data
  return Array.isArray(data) ? (data as Record<string, unknown>[]) : []
}

const sheetId = (tenant: string): string => `styles_${tenant}`

/** Every class defined for `tenant`, in author order. */
export async function loadStyleClasses(
  dbal: string,
  tenant: string,
  signal?: AbortSignal
): Promise<StyleClassShape[]> {
  const base = `${dbal}/${tenant}/core`
  const q = `?filter.styleClassId=${encodeURIComponent(sheetId(tenant))}&limit=2000`

  // An unreachable or erroring data layer means "no classes published yet",
  // not a thrown rejection: this runs from an effect in the builder, where a
  // rejected promise is an uncaught error in the console and nothing more.
  let rules: RuleRow[]
  let props: PropRow[]
  try {
    const [ruleRes, propRes] = await Promise.all([
      fetch(`${base}/StyleRule${q}`, { signal, cache: 'no-store' }),
      fetch(`${base}/StyleRuleProp${q}`, { signal, cache: 'no-store' }),
    ])
    if (!ruleRes.ok || !propRes.ok) return []
    rules = rowsOf(await ruleRes.json()) as unknown as RuleRow[]
    props = rowsOf(await propRes.json()) as unknown as PropRow[]
  } catch {
    return []
  }

  const byRule = new Map<string, Record<string, string>>()
  for (const p of props) {
    const bag = byRule.get(p.ruleId) ?? {}
    bag[p.name] = p.value ?? ''
    byRule.set(p.ruleId, bag)
  }

  return [...rules]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(r => ({ id: r.ruleKey, name: r.name, props: byRule.get(r.id) ?? {} }))
}

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
  const json = { 'Content-Type': 'application/json' }
  const id = sheetId(tenant)

  await fetch(`${base}/StyleClass/${id}`, { method: 'DELETE' }).catch(() => null)

  const sheet = await fetch(`${base}/StyleClass`, {
    method: 'POST',
    headers: json,
    body: JSON.stringify({ id, tenantId: tenant }),
  })
  if (!sheet.ok) return false

  for (const [index, css] of classes.entries()) {
    const ruleRes = await fetch(`${base}/StyleRule`, {
      method: 'POST',
      headers: json,
      body: JSON.stringify({
        tenantId: tenant,
        styleClassId: id,
        ruleKey: css.id,
        name: css.name,
        sortOrder: index,
      }),
    })
    if (!ruleRes.ok) return false
    const created = (await ruleRes.json()) as { data?: { id?: string } }
    const ruleId = created.data?.id
    if (typeof ruleId !== 'string') return false

    for (const [name, value] of Object.entries(css.props)) {
      const propRes = await fetch(`${base}/StyleRuleProp`, {
        method: 'POST',
        headers: json,
        body: JSON.stringify({
          tenantId: tenant,
          ruleId,
          styleClassId: id,
          name,
          value,
        }),
      })
      if (!propRes.ok) return false
    }
  }
  return true
}
