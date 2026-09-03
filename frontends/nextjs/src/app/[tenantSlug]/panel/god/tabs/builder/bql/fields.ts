/**
 * Matches a BQL attribute's English key against a block's real prop schema,
 * and turns its text value into what that prop actually stores. Someone
 * writing BQL by hand only ever sees a field's label ("Style") in the
 * visual editor, not its prop key ("variant"), so both must resolve.
 */
import type { PropField } from '@/components/blocks/block-props'

const normalize = (value: string): string =>
  value.toLowerCase().replace(/[\s-]+/g, '')

export function resolveField(
  fields: PropField[],
  key: string
): PropField | undefined {
  const target = normalize(key)
  return fields.find(
    field =>
      normalize(field.name) === target || normalize(field.label) === target
  )
}

type Coerced = { value: unknown } | { error: string }

export function coerceValue(field: PropField, raw: string): Coerced {
  if (field.type === 'number') {
    const value = Number(raw)
    return Number.isNaN(value) ? { error: `"${raw}" is not a number` } : { value }
  }
  if (field.type === 'boolean') {
    const lower = raw.toLowerCase()
    if (['true', 'yes'].includes(lower)) return { value: true }
    if (['false', 'no'].includes(lower)) return { value: false }
    return { error: `"${raw}" is not yes/no` }
  }
  if (field.type === 'select') {
    const match = (field.options ?? []).find(
      option =>
        option.value.toLowerCase() === raw.toLowerCase() ||
        option.label.toLowerCase() === raw.toLowerCase()
    )
    if (match === undefined) {
      const choices = (field.options ?? []).map(o => o.label).join(', ')
      return { error: `"${raw}" is not one of: ${choices}` }
    }
    return { value: match.value }
  }
  return { value: raw }
}
