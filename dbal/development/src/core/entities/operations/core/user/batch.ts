import { randomUUID } from 'crypto'
import type { DBALAdapter } from '../../../../../adapters/adapter'
import type { CreateUserInput, UpdateUserInput, User } from '../../../../../core/foundation/types'
import { DBALError } from '../../../../../core/foundation/errors'
import { validateUserCreate, validateUserUpdate } from '../../../../../core/foundation/validation'

export const createManyUsers = async (
  adapter: DBALAdapter,
  data: CreateUserInput[],
): Promise<number> => {
  if (!data || data.length === 0) {
    return 0
  }

  const now = BigInt(Date.now())
  const payload: User[] = data.map(item => ({
    id: item.id ?? randomUUID(),
    username: item.username,
    email: item.email,
    role: item.role,
    profilePicture: item.profilePicture ?? null,
    bio: item.bio ?? null,
    createdAt: item.createdAt ?? now,
    tenantId: item.tenantId ?? null,
    isInstanceOwner: item.isInstanceOwner ?? false,
    passwordChangeTimestamp: item.passwordChangeTimestamp ?? null,
    firstLogin: item.firstLogin ?? false,
  }))

  const validationErrors = payload.flatMap((item, index) =>
    validateUserCreate(item).map(error => ({ field: `users[${index}]`, error })),
  )
  if (validationErrors.length > 0) {
    throw DBALError.validationError('Invalid user batch', validationErrors)
  }

  try {
    return adapter.createMany('User', payload as unknown as Record<string, unknown>[])
  } catch (error) {
    if (error instanceof DBALError && error.code === 409) {
      throw DBALError.conflict('Username or email already exists')
    }
    throw error
  }
}

export const updateManyUsers = async (
  adapter: DBALAdapter,
  filter: Record<string, unknown>,
  data: UpdateUserInput,
): Promise<number> => {
  if (!filter || Object.keys(filter).length === 0) {
    throw DBALError.validationError('Bulk update requires a filter', [
      { field: 'filter', error: 'Filter is required' },
    ])
  }

  // Check that filter has at least one field besides tenantId
  const filterKeys = Object.keys(filter).filter(k => k !== 'tenantId')
  if (filterKeys.length === 0) {
    throw DBALError.validationError('Bulk update requires a filter', [
      { field: 'filter', error: 'Filter must include at least one field besides tenantId' },
    ])
  }

  if (!data || Object.keys(data).length === 0) {
    throw DBALError.validationError('Bulk update requires data', [
      { field: 'data', error: 'Update data is required' },
    ])
  }

  const validationErrors = validateUserUpdate(data)
  if (validationErrors.length > 0) {
    throw DBALError.validationError('Invalid user update data', validationErrors.map(error => ({ field: 'user', error })))
  }

  try {
    return adapter.updateMany('User', filter, data as unknown as Record<string, unknown>)
  } catch (error) {
    if (error instanceof DBALError && error.code === 409) {
      throw DBALError.conflict('Username or email already exists')
    }
    throw error
  }
}

export const deleteManyUsers = async (adapter: DBALAdapter, filter: Record<string, unknown>): Promise<number> => {
  if (!filter || Object.keys(filter).length === 0) {
    throw DBALError.validationError('Bulk delete requires a filter', [
      { field: 'filter', error: 'Filter is required' },
    ])
  }

  return adapter.deleteMany('User', filter)
}
