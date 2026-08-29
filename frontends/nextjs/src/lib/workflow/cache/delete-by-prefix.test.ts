import { describe, expect, it } from 'vitest'

import { ValidationCache } from './validation-cache'

const entry = { valid: true, errors: [], warnings: [] } as never

describe('ValidationCache.deleteByPrefix', () => {
  const seeded = () => {
    const cache = new ValidationCache(60000, 100)
    cache.set('t1:wf1:hashA', entry)
    cache.set('t1:wf1:hashB', entry)
    cache.set('t1:wf2:hashA', entry)
    cache.set('t2:wf1:hashA', entry)
    return cache
  }

  it('removes every version of one workflow', () => {
    const cache = seeded()

    expect(cache.deleteByPrefix('t1:wf1:')).toBe(2)
    expect(cache.get('t1:wf1:hashA')).toBeNull()
    expect(cache.get('t1:wf1:hashB')).toBeNull()
  })

  it('leaves other workflows alone', () => {
    const cache = seeded()

    cache.deleteByPrefix('t1:wf1:')

    expect(cache.get('t1:wf2:hashA')).not.toBeNull()
  })

  it('leaves the same workflow id in another tenant alone', () => {
    const cache = seeded()

    cache.deleteByPrefix('t1:wf1:')

    expect(cache.get('t2:wf1:hashA')).not.toBeNull()
  })

  it('reports zero when nothing matches', () => {
    expect(seeded().deleteByPrefix('t9:wf9:')).toBe(0)
  })

  it('requires the trailing separator to avoid a prefix collision', () => {
    // Without the colon, `t1:wf1` would also match a `t1:wf10` key.
    const cache = new ValidationCache(60000, 100)
    cache.set('t1:wf10:hash', entry)

    expect(cache.deleteByPrefix('t1:wf1:')).toBe(0)
    expect(cache.get('t1:wf10:hash')).not.toBeNull()
  })
})
