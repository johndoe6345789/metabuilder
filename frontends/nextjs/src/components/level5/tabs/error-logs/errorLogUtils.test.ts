import { describe, expect, it } from 'vitest'

import type { ErrorLog } from '@/lib/db/error-logs'

import { calculateStats, filterLogs } from './errorLogUtils'

const sampleLogs: ErrorLog[] = [
  { id: '1', message: 'Error', level: 'error', timestamp: Date.now(), resolved: false },
  { id: '2', message: 'Warning', level: 'warning', timestamp: Date.now(), resolved: true },
  { id: '3', message: 'Info', level: 'info', timestamp: Date.now(), resolved: false },
]

describe('calculateStats', () => {
  it('calculates counts by level and resolution', () => {
    const stats = calculateStats(sampleLogs)

    expect(stats.total).toBe(3)
    expect(stats.errors).toBe(1)
    expect(stats.warnings).toBe(1)
    expect(stats.info).toBe(1)
    expect(stats.resolved).toBe(1)
    expect(stats.unresolved).toBe(2)
  })
})

describe('filterLogs', () => {
  it('filters by level', () => {
    const filtered = filterLogs(sampleLogs, { filterLevel: 'error', filterResolved: 'all' })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].level).toBe('error')
  })

  it('filters by resolved state', () => {
    const filtered = filterLogs(sampleLogs, { filterLevel: 'all', filterResolved: 'resolved' })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].resolved).toBe(true)
  })

  it('returns all when filters are set to all', () => {
    const filtered = filterLogs(sampleLogs, { filterLevel: 'all', filterResolved: 'all' })
    expect(filtered).toHaveLength(sampleLogs.length)
  })
})
