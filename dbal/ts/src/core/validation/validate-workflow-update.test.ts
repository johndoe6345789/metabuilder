import { describe, expect, it } from 'vitest'
import { validateWorkflowUpdate } from './validate-workflow-update'

describe('validateWorkflowUpdate', () => {
  it.each([
    { data: { name: 'Updated' } },
    { data: { isActive: false } },
  ])('accepts %s', ({ data }) => {
    expect(validateWorkflowUpdate(data)).toEqual([])
  })

  it.each([
    { data: { trigger: 'invalid' as unknown as 'manual' }, message: 'trigger must be one of manual, schedule, event, webhook' },
    { data: { isActive: 'yes' as unknown as boolean }, message: 'isActive must be a boolean' },
    { data: { triggerConfig: [] }, message: 'triggerConfig must be an object' },
  ])('rejects %s', ({ data, message }) => {
    expect(validateWorkflowUpdate(data)).toContain(message)
  })
})
