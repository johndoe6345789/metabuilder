import { describe, it, expect, beforeEach, vi } from 'vitest'

const { getWorkflows, addWorkflow } = vi.hoisted(() => ({
  getWorkflows: vi.fn(),
  addWorkflow: vi.fn(),
}))

vi.mock('@/lib/database', () => ({
  Database: {
    getWorkflows,
    addWorkflow,
  },
}))

import { initializeWorkflows } from '@/seed-data/workflows'

const expectedWorkflowIds = [
  'workflow_user_registration',
  'workflow_page_access',
  'workflow_comment_submission',
  'workflow_package_export',
]

describe('initializeWorkflows', () => {
  beforeEach(() => {
    getWorkflows.mockReset()
    addWorkflow.mockReset()
  })

  it.each([
    {
      name: 'skip seeding when workflows exist',
      existingWorkflows: [{ id: 'existing' }],
      expectedAdds: 0,
    },
    {
      name: 'seed default workflows when none exist',
      existingWorkflows: [],
      expectedAdds: expectedWorkflowIds.length,
    },
  ])('should $name', async ({ existingWorkflows, expectedAdds }) => {
    getWorkflows.mockResolvedValue(existingWorkflows)

    await initializeWorkflows()

    expect(getWorkflows).toHaveBeenCalledTimes(1)
    expect(addWorkflow).toHaveBeenCalledTimes(expectedAdds)

    if (expectedAdds > 0) {
      expectedWorkflowIds.forEach(id => {
        expect(addWorkflow).toHaveBeenCalledWith(expect.objectContaining({ id }))
      })
    }
  })
})
