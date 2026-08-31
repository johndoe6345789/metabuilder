import type { JsonValue } from '@/types/utility-types'

/** The one truthiness rule this renderer uses everywhere a JSON value
 *  drives a boolean decision (conditionals, negation, ternaries) --
 *  null/undefined/false/0/'' are false, anything else is true. */
export function isTruthy(value: JsonValue | undefined): boolean {
  return (
    value !== null &&
    value !== undefined &&
    value !== false &&
    value !== 0 &&
    value !== ''
  )
}
