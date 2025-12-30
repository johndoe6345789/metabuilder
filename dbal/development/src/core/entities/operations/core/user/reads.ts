import type { DBALAdapter } from '../../../../adapters/adapter'
import type { User, ListOptions, ListResult } from '../../../../foundation/types'
import { DBALError } from '../../../../foundation/errors'
import { validateId } from '../../../../foundation/validation'

export const readUser = async (adapter: DBALAdapter, id: string): Promise<User | null> => {
  const validationErrors = validateId(id)
  if (validationErrors.length > 0) {
    throw DBALError.validationError('Invalid user ID', validationErrors.map(error => ({ field: 'id', error })))
  }

  const result = await adapter.read('User', id) as User | null
  if (!result) {
    throw DBALError.notFound(`User not found: ${id}`)
  }
  return result
}

export const listUsers = (adapter: DBALAdapter, options?: ListOptions): Promise<ListResult<User>> => {
  return adapter.list('User', options) as Promise<ListResult<User>>
}
