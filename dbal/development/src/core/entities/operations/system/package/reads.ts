import type { DBALAdapter } from '../../../../adapters/adapter'
import type { Package, ListOptions, ListResult } from '../../../../foundation/types'
import { DBALError } from '../../../../foundation/errors'
import { validateId } from '../../../../foundation/validation'

export const readPackage = async (adapter: DBALAdapter, id: string): Promise<Package | null> => {
  const validationErrors = validateId(id)
  if (validationErrors.length > 0) {
    throw DBALError.validationError('Invalid package ID', validationErrors.map(error => ({ field: 'id', error })))
  }

  const result = await adapter.read('Package', id) as Package | null
  if (!result) {
    throw DBALError.notFound(`Package not found: ${id}`)
  }
  return result
}

export const listPackages = (adapter: DBALAdapter, options?: ListOptions): Promise<ListResult<Package>> => {
  return adapter.list('Package', options) as Promise<ListResult<Package>>
}
