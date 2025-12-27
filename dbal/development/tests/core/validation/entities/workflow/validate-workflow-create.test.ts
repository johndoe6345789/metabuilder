import { describe, expect, it } from 'vitest'
import { validateWorkflowCreate } from '../../../src/core/validation/validate-workflow-create'

describe('validateWorkflowCreate', () => {
  const base = {
    name: 'Daily Sync',
    trigger: 'schedule' as const,
    triggerConfig: { cron: '0 0 * * *' },
    steps: { nodes: [] },
    isActive: true,
    createdBy: '550e8400-e29b-41d4-a716-446655440000',
  }

  it.each([
    { data: base, expected: [] },
  ])('returns $expected for valid case', ({ data, expected }) => {
    expect(validateWorkflowCreate(data)).toEqual(expected)
  })

  it.each([
    { data: { ...base, trigger: 'invalid' as unknown as 'manual' }, message: 'trigger must be one of manual, schedule, event, webhook' },
    { data: { ...base, steps: [] }, message: 'steps must be an object' },
    { data: { ...base, createdBy: 'invalid' }, message: 'createdBy must be a valid UUID' },
    { data: { ...base, name: 'a'.repeat(256) }, message: 'name must be 1-255 characters' },
  ])('rejects invalid case', ({ data, message }) => {
    expect(validateWorkflowCreate(data)).toContain(message)
  })
})
