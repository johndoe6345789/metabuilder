/**
 * "Only carry on if" -- the one step that can stop a workflow.
 *
 * `is` takes equals, contains, empty, not empty, exactly as the step's
 * own help text says. An `is` the step does not know stops the run rather
 * than waving it through: a condition nobody can evaluate is not a
 * condition that passed, and the steps after it are the ones that write.
 */

export const CONDITIONS = ['equals', 'contains', 'empty', 'not empty']

const text = (value: unknown): string => {
  if (value === undefined || value === null) return ''
  return typeof value === 'string' ? value : JSON.stringify(value)
}

export interface ConditionOutcome {
  holds: boolean
  /** Why, in the words the tab shows beside the step. */
  because: string
}

export function evaluateCondition(
  value: unknown,
  is: string,
  other: unknown
): ConditionOutcome {
  const left = text(value)
  const right = text(other)
  switch (is.trim().toLowerCase()) {
    case 'equals':
      return {
        holds: left === right,
        because: `"${left}" ${left === right ? '=' : '≠'} "${right}"`,
      }
    case 'contains':
      return {
        holds: left.includes(right),
        because: `"${left}" ${left.includes(right) ? 'has' : 'lacks'} "${right}"`,
      }
    case 'empty':
      return { holds: left === '', because: `"${left}" is not empty` }
    case 'not empty':
      return { holds: left !== '', because: 'it was empty' }
    default:
      return { holds: false, because: `no such test as "${is}"` }
  }
}
