import type { LuaScript } from '../types'
import { isAllowedLuaGlobal } from '../../predicates/lua/is-allowed-lua-global'
import { isValidJsonString } from '../../predicates/string/is-valid-json'

export function validateLuaScriptUpdate(data: Partial<LuaScript>): string[] {
  const errors: string[] = []

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.length === 0 || data.name.length > 255) {
      errors.push('name must be 1-255 characters')
    }
  }

  if (data.code !== undefined) {
    if (typeof data.code !== 'string' || data.code.trim().length === 0) {
      errors.push('code must be a non-empty string')
    }
  }

  if (data.parameters !== undefined) {
    if (typeof data.parameters !== 'string' || !isValidJsonString(data.parameters)) {
      errors.push('parameters must be a JSON string')
    }
  }

  if (data.returnType !== undefined && data.returnType !== null && typeof data.returnType !== 'string') {
    errors.push('returnType must be a string')
  }

  if (data.isSandboxed !== undefined && typeof data.isSandboxed !== 'boolean') {
    errors.push('isSandboxed must be a boolean')
  }

  if (data.allowedGlobals !== undefined) {
    if (typeof data.allowedGlobals !== 'string' || !isValidJsonString(data.allowedGlobals)) {
      errors.push('allowedGlobals must be a JSON string')
    } else {
      try {
        const parsed = JSON.parse(data.allowedGlobals) as unknown
        if (!Array.isArray(parsed)) {
          errors.push('allowedGlobals must be a JSON array')
        } else if (parsed.some(entry => typeof entry !== 'string' || entry.trim().length === 0)) {
          errors.push('allowedGlobals must contain non-empty strings')
        } else {
          const invalidGlobals = parsed.filter((entry) => !isAllowedLuaGlobal(entry))
          if (invalidGlobals.length > 0) {
            errors.push(`allowedGlobals contains forbidden globals: ${invalidGlobals.join(', ')}`)
          }
        }
      } catch {
        errors.push('allowedGlobals must be valid JSON')
      }
    }
  }

  if (data.timeoutMs !== undefined) {
    if (!Number.isInteger(data.timeoutMs) || data.timeoutMs < 100 || data.timeoutMs > 30000) {
      errors.push('timeoutMs must be an integer between 100 and 30000')
    }
  }

  if (data.version !== undefined && (!Number.isInteger(data.version) || data.version < 1)) {
    errors.push('version must be a positive integer')
  }

  if (data.createdAt !== undefined && data.createdAt !== null && typeof data.createdAt !== 'bigint') {
    errors.push('createdAt must be a bigint timestamp')
  }

  if (data.updatedAt !== undefined && data.updatedAt !== null && typeof data.updatedAt !== 'bigint') {
    errors.push('updatedAt must be a bigint timestamp')
  }

  if (data.createdBy !== undefined && data.createdBy !== null) {
    if (typeof data.createdBy !== 'string' || data.createdBy.trim().length === 0) {
      errors.push('createdBy must be a non-empty string')
    }
  }

  if (data.tenantId !== undefined && data.tenantId !== null && typeof data.tenantId !== 'string') {
    errors.push('tenantId must be a string')
  }

  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.push('description must be a string')
  }

  return errors
}
