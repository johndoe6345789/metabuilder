/**
 * Sort records by a field in a given direction
 * @param records - The records to sort
 * @param field - The field name to sort by
 * @param direction - Sort direction ('asc' or 'desc')
 * @returns Sorted copy of the records array
 */
import type { JsonValue } from '@/types/utility-types'

export const sortRecords = (
  records: Record<string, JsonValue>[],
  field: string,
  direction: 'asc' | 'desc'
): Record<string, JsonValue>[] => {
  return [...records].sort((a, b) => {
    const aVal = a[field]
    const bVal = b[field]

    if (aVal === bVal) return 0
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1

    const comparison = aVal < bVal ? -1 : 1
    return direction === 'asc' ? comparison : -comparison
  })
}
