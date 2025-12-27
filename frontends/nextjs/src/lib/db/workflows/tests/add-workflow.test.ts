import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCreate = vi.fn()
const mockAdapter = { create: mockCreate }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { addWorkflow } from './add-workflow'

describe('addWorkflow', () => {
  beforeEach(() => {
    mockCreate.mockReset()
  })

  it.each([
    {
      name: 'basic workflow',
      workflow: { id: 'w1', name: 'Test', nodes: [], edges: [], enabled: true },
    },
    {
      name: 'workflow with description',
      workflow: { id: 'w2', name: 'Process', description: 'A workflow', nodes: [{}], edges: [], enabled: false },
    },
  ])('should add $name', async ({ workflow }) => {
    mockCreate.mockResolvedValue(undefined)

    await addWorkflow(workflow as any)

    expect(mockCreate).toHaveBeenCalledWith('Workflow', expect.objectContaining({
      id: workflow.id,
      name: workflow.name,
      enabled: workflow.enabled,
    }))
  })
})
