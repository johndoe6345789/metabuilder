import { describe, expect, it } from 'vitest'

import { normalizeTenant, tenantLabel, unwrapList } from './credentials-data'

describe('unwrapList', () => {
  it('takes a bare array as-is', () => {
    expect(unwrapList<number>([1, 2])).toEqual([1, 2])
  })

  it('unwraps one level of data', () => {
    expect(unwrapList<number>({ data: [1] })).toEqual([1])
  })

  it('unwraps two levels of data', () => {
    expect(unwrapList<number>({ data: { data: [1, 2] } })).toEqual([1, 2])
  })

  it.each([[null], [undefined], ['text'], [42], [{}], [{ data: 3 }]])(
    'answers an empty list for %p rather than throwing',
    input => {
      expect(unwrapList(input)).toEqual([])
    }
  )

  it('does not dig past the second level', () => {
    // Three levels would mean the response shape changed underneath us;
    // an empty table is a better signal than a guess.
    expect(unwrapList({ data: { data: { data: [1] } } })).toEqual([])
  })
})

describe('tenantLabel', () => {
  it('spells out the all-tenants pseudo-tenant', () => {
    expect(tenantLabel('all')).toBe('All tenants')
  })

  it('shows a real tenant under its own id', () => {
    expect(tenantLabel('system')).toBe('system')
  })
})

describe('normalizeTenant', () => {
  it.each([[null], [undefined], [''], ['   ']])(
    'treats %p as the system tenant',
    value => {
      expect(normalizeTenant(value)).toBe('system')
    }
  )

  it('trims a real tenant id', () => {
    expect(normalizeTenant('  acme ')).toBe('acme')
  })
})
