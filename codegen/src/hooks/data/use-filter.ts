import { useState, useMemo } from 'react'

export interface FilterConfig<T> {
  field: keyof T
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'in' | 'notIn'
  value: any
}

export interface UseFilterOptions<T> {
  items: T[]
  initialFilters?: FilterConfig<T>[]
}

export function useFilter<T>(options: UseFilterOptions<T>) {
  const { items, initialFilters = [] } = options
  const [filters, setFilters] = useState<FilterConfig<T>[]>(initialFilters)

  const filtered = useMemo(() => {
    if (filters.length === 0) return items

    return items.filter(item => {
      return filters.every(filter => {
        const value = item[filter.field]
        
        switch (filter.operator) {
          case 'equals':
            return value === filter.value
          case 'notEquals':
            return value !== filter.value
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase())
          case 'greaterThan':
            return value > filter.value
          case 'lessThan':
            return value < filter.value
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(value)
          case 'notIn':
            return Array.isArray(filter.value) && !filter.value.includes(value)
          default:
            return true
        }
      })
    })
  }, [items, filters])

  const addFilter = (filter: FilterConfig<T>) => {
    setFilters(prev => [...prev, filter])
  }

  const removeFilter = (index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index))
  }

  const clearFilters = () => {
    setFilters([])
  }

  const updateFilter = (index: number, filter: FilterConfig<T>) => {
    setFilters(prev => prev.map((f, i) => i === index ? filter : f))
  }

  return {
    filtered,
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    updateFilter,
    hasFilters: filters.length > 0,
    filterCount: filters.length,
  }
}
