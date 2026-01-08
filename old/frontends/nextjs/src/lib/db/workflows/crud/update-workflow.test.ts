import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Workflow } from '@/lib/types/level-types'

const mockUpdate = vi.fn()
const mockAdapter = { update: mockUpdate }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { updateWorkflow } from './update-workflow'

describe('updateWorkflow', () => {
  beforeEach(() => {
    mockUpdate.mockReset()
  })

  it.each([
    { id: 'w1', updates: { name: 'New Name' } },
    { id: 'w2', updates: { enabled: false, description: 'Updated' } },
  ])('should update $id', async ({ id, updates }) => {
    mockUpdate.mockResolvedValue(undefined)

    await updateWorkflow(id, updates as Partial<Workflow>)

    expect(mockUpdate).toHaveBeenCalledWith('Workflow', id, expect.any(Object))
  })
})
