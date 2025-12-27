import type { Workflow } from '../types'
import { isPlainObject } from './is-plain-object'
import { isValidUuid } from './is-valid-uuid'

const triggerValues = ['manual', 'schedule', 'event', 'webhook'] as const

export function validateWorkflowUpdate(data: Partial<Workflow>): string[] {
  const errors: string[] = []

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.length === 0 || data.name.length > 255) {
      errors.push('name must be 1-255 characters')
    }
  }

  if (data.trigger !== undefined && !triggerValues.includes(data.trigger)) {
    errors.push('trigger must be one of manual, schedule, event, webhook')
  }

  if (data.triggerConfig !== undefined && !isPlainObject(data.triggerConfig)) {
    errors.push('triggerConfig must be an object')
  }

  if (data.steps !== undefined && !isPlainObject(data.steps)) {
    errors.push('steps must be an object')
  }

  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    errors.push('isActive must be a boolean')
  }

  if (data.createdBy !== undefined) {
    if (typeof data.createdBy !== 'string' || !isValidUuid(data.createdBy)) {
      errors.push('createdBy must be a valid UUID')
    }
  }

  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.push('description must be a string')
  }

  return errors
}
