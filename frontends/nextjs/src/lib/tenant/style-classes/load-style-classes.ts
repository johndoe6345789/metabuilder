import { readList } from '@/lib/db/read-list'
import { sheetId } from './sheet-id'
import type { PropRow, RuleRow, StyleClassShape } from './types'

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
    rules = readList<RuleRow>(await ruleRes.json())
    props = readList<PropRow>(await propRes.json())
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
