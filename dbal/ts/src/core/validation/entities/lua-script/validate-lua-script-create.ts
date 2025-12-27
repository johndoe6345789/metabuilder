import type { LuaScript } from '../types'
import { isAllowedLuaGlobal } from '../../predicates/lua/is-allowed-lua-global'
import { isValidUuid } from '../../predicates/is-valid-uuid'

export function validateLuaScriptCreate(data: Partial<LuaScript>): string[] {
  const errors: string[] = []

  if (!data.name) {
    errors.push('name is required')
  } else if (typeof data.name !== 'string' || data.name.length > 255) {
    errors.push('name must be 1-255 characters')
  }

  if (!data.code) {
    errors.push('code is required')
  } else if (typeof data.code !== 'string' || data.code.trim().length === 0) {
    errors.push('code must be a non-empty string')
  }

  if (data.isSandboxed === undefined) {
    errors.push('isSandboxed is required')
  } else if (typeof data.isSandboxed !== 'boolean') {
    errors.push('isSandboxed must be a boolean')
  }

  if (data.allowedGlobals === undefined) {
    errors.push('allowedGlobals is required')
  } else if (!Array.isArray(data.allowedGlobals)) {
    errors.push('allowedGlobals must be an array of strings')
  } else if (data.allowedGlobals.some(entry => typeof entry !== 'string' || entry.trim().length === 0)) {
    errors.push('allowedGlobals must contain non-empty strings')
  } else {
    const invalidGlobals = data.allowedGlobals.filter((entry) => !isAllowedLuaGlobal(entry))
    if (invalidGlobals.length > 0) {
      errors.push(`allowedGlobals contains forbidden globals: ${invalidGlobals.join(', ')}`)
    }
  }

  if (data.timeoutMs === undefined) {
    errors.push('timeoutMs is required')
  } else if (!Number.isInteger(data.timeoutMs) || data.timeoutMs < 100 || data.timeoutMs > 30000) {
    errors.push('timeoutMs must be an integer between 100 and 30000')
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
