import type { DBALAdapter } from '../../../../../adapters/adapter'
import { DBALError } from '../../../../../core/foundation/errors'
import { assertValidUserId } from './validation'

export const deleteUser = async (adapter: DBALAdapter, id: string): Promise<boolean> => {
  assertValidUserId(id)

  const result = await adapter.delete('User', id)
  if (!result) {
    throw DBALError.notFound(`User not found: ${id}`)
  }
  return result
}
