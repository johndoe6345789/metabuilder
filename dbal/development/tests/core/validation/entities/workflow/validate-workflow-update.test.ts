import { describe, expect, it } from 'vitest'
import { validateWorkflowUpdate } from '../../../src/core/validation/validate-workflow-update'

describe('validateWorkflowUpdate', () => {
  it.each([
    { data: { name: 'Updated' }, expected: [] },
    { data: { isActive: false }, expected: [] },
  ])('returns $expected for valid case', ({ data, expected }) => {
    expect(validateWorkflowUpdate(data)).toEqual(expected)
  })

  it.each([
    { data: { trigger: 'invalid' as unknown as 'manual' }, message: 'trigger must be one of manual, schedule, event, webhook' },
    { data: { isActive: 'yes' as unknown as boolean }, message: 'isActive must be a boolean' },
    { data: { triggerConfig: [] }, message: 'triggerConfig must be an object' },
  ])('rejects invalid case', ({ data, message }) => {
    expect(validateWorkflowUpdate(data)).toContain(message)
  })
})
