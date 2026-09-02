import { beforeEach, describe, expect, it, vi } from 'vitest'

const opsMod = vi.hoisted(() => ({ createOps: vi.fn(() => ({ tag: 'ops' })) }))
vi.mock('./create-ops', () => opsMod)

import { db } from './client'

beforeEach(() => {
  opsMod.createOps.mockClear()
})

describe('db.entity', () => {
  it('creates ops for the default tenant when none is given', () => {
    db.entity('User')
    expect(opsMod.createOps).toHaveBeenCalledWith('User', undefined)
  })

  it('creates ops for an explicit tenant', () => {
    db.entity('User', 'acme')
    expect(opsMod.createOps).toHaveBeenCalledWith('User', 'acme')
  })

  it('does not cache across different tenants', () => {
    const first = db.entity('User', 'acme')
    const second = db.entity('User', 'other')
    expect(opsMod.createOps).toHaveBeenCalledTimes(2)
    expect(first).toEqual(second)
  })
})
