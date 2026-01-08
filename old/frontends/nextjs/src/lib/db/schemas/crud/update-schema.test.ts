import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockUpdate = vi.fn()
const mockAdapter = { update: mockUpdate }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { updateSchema } from './update-schema'

describe('updateSchema', () => {
  beforeEach(() => {
    mockUpdate.mockReset()
  })

  it.each([
    { name: 'User', updates: { label: 'User Account' } },
    { name: 'Post', updates: { fields: [{ name: 'title', type: 'string' }] } },
  ])('should update $name', async ({ name, updates }) => {
    mockUpdate.mockResolvedValue(undefined)

     
    await updateSchema(name, updates as any)

    expect(mockUpdate).toHaveBeenCalledWith('ModelSchema', name, expect.any(Object))
  })
})
