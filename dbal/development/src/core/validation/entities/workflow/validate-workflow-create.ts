import type { Workflow } from '../types'
import { isPlainObject } from '../../predicates/is-plain-object'
import { isValidUuid } from '../../predicates/is-valid-uuid'

const triggerValues = ['manual', 'schedule', 'event', 'webhook'] as const

export function validateWorkflowCreate(data: Partial<Workflow>): string[] {
  const errors: string[] = []

  if (!data.name) {
    errors.push('name is required')
  } else if (typeof data.name !== 'string' || data.name.length > 255) {
    errors.push('name must be 1-255 characters')
  }

  if (!data.trigger) {
    errors.push('trigger is required')
  } else if (!triggerValues.includes(data.trigger)) {
    errors.push('trigger must be one of manual, schedule, event, webhook')
  }

  if (data.triggerConfig === undefined) {
    errors.push('triggerConfig is required')
  } else if (!isPlainObject(data.triggerConfig)) {
    errors.push('triggerConfig must be an object')
  }

  if (data.steps === undefined) {
    errors.push('steps is required')
  } else if (!isPlainObject(data.steps)) {
    errors.push('steps must be an object')
  }

  if (data.isActive === undefined) {
    errors.push('isActive is required')
  } else if (typeof data.isActive !== 'boolean') {
    errors.push('isActive must be a boolean')
  }

  if (!data.createdBy) {
    errors.push('createdBy is required')
  } else if (!isValidUuid(data.createdBy)) {
    errors.push('createdBy must be a valid UUID')
  }

  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.push('description must be a string')
  }

  return errors
}
