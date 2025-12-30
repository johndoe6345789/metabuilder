import type { DBALAdapter } from '../../../../adapters/adapter'
import type { Package } from '../../../../foundation/types'
import { DBALError } from '../../../../foundation/errors'
import { validatePackageCreate, validatePackageUpdate, validateId } from '../../../../foundation/validation'

export const createPackage = async (
  adapter: DBALAdapter,
  data: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Package> => {
  const validationErrors = validatePackageCreate(data)
  if (validationErrors.length > 0) {
    throw DBALError.validationError('Invalid package data', validationErrors.map(error => ({ field: 'package', error })))
  }

  try {
    return adapter.create('Package', data) as Promise<Package>
  } catch (error) {
    if (error instanceof DBALError && error.code === 409) {
      throw DBALError.conflict(`Package ${data.name}@${data.version} already exists`)
    }
    throw error
  }
}

export const updatePackage = async (
  adapter: DBALAdapter,
  id: string,
  data: Partial<Package>,
): Promise<Package> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    throw DBALError.validationError('Invalid package ID', idErrors.map(error => ({ field: 'id', error })))
  }

  const validationErrors = validatePackageUpdate(data)
  if (validationErrors.length > 0) {
    throw DBALError.validationError('Invalid package update data', validationErrors.map(error => ({ field: 'package', error })))
  }

  try {
    return adapter.update('Package', id, data) as Promise<Package>
  } catch (error) {
    if (error instanceof DBALError && error.code === 409) {
      throw DBALError.conflict('Package name+version already exists')
    }
    throw error
  }
}

export const deletePackage = async (adapter: DBALAdapter, id: string): Promise<boolean> => {
  const validationErrors = validateId(id)
  if (validationErrors.length > 0) {
    throw DBALError.validationError('Invalid package ID', validationErrors.map(error => ({ field: 'id', error })))
  }

  const result = await adapter.delete('Package', id)
  if (!result) {
    throw DBALError.notFound(`Package not found: ${id}`)
  }
  return result
}
