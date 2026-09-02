import type { PropField } from '@/components/blocks/block-props'

const isEmpty = (value: unknown): boolean =>
  typeof value !== 'string' || value.trim() === ''

/** The field's `warnIfEmpty` message, if the field is currently empty and
 *  the rest of the block's properties make that worth mentioning --
 *  `undefined` otherwise, so a field with no such rule never renders one. */
export function fieldWarning(
  field: PropField,
  current: unknown,
  allProps: Record<string, unknown>
): string | undefined {
  const rule = field.warnIfEmpty
  if (rule === undefined) return undefined
  if (!isEmpty(current)) return undefined
  return rule.when(allProps) ? rule.message : undefined
}
