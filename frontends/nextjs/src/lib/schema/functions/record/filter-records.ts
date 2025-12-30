import type { JsonValue } from '@/types/utility-types'

/**
 * Filter records by search term and field filters
 * @param records - The records to filter
 * @param searchTerm - Search string to match against searchFields
 * @param searchFields - Fields to search in
 * @param filters - Field-value pairs to filter by
 * @returns Filtered records array
 */

export const filterRecords = (
  records: Record<string, JsonValue>[],
  searchTerm: string,
  searchFields: string[],
  filters: Record<string, JsonValue>
): Record<string, JsonValue>[] => {
  let filtered = records

  if (searchTerm) {
    filtered = filtered.filter(record => {
      return searchFields.some(field => {
        const value = record[field]
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(searchTerm.toLowerCase())
      })
    })
  }

  Object.entries(filters).forEach(([field, filterValue]) => {
    if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
      filtered = filtered.filter(record => record[field] === filterValue)
    }
  })

  return filtered
}
