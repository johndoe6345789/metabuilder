import type { DBALAdapter } from '../../../../../adapters/adapter'
import type { Package } from '../../../../foundation/types'
import { DBALError } from '../../../../foundation/errors'
import { validatePackageCreate, validatePackageUpdate } from '../../../../foundation/validation'

export const createManyPackages = async (
  adapter: DBALAdapter,
  data: Array<Omit<Package, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<number> => {
  if (!data || data.length === 0) {
    return 0
  }

  const validationErrors = data.flatMap((item, index) =>
    validatePackageCreate(item).map(error => ({ field: `packages[${index}]`, error })),
  )
  if (validationErrors.length > 0) {
    throw DBALError.validationError('Invalid package batch', validationErrors)
  }

  try {
    return adapter.createMany('Package', data as Record<string, unknown>[])
  } catch (error) {
    if (error instanceof DBALError && error.code === 409) {
      throw DBALError.conflict('Package name+version already exists')
    }
    throw error
  }
}

export const updateManyPackages = async (
  adapter: DBALAdapter,
  filter: Record<string, unknown>,
  data: Partial<Package>,
): Promise<number> => {
  if (!filter || Object.keys(filter).length === 0) {
    throw DBALError.validationError('Bulk update requires a filter', [
      { field: 'filter', error: 'Filter is required' },
    ])
  }

  if (!data || Object.keys(data).length === 0) {
    throw DBALError.validationError('Bulk update requires data', [
      { field: 'data', error: 'Update data is required' },
    ])
  }

  const validationErrors = validatePackageUpdate(data)
  if (validationErrors.length > 0) {
    throw DBALError.validationError('Invalid package update data', validationErrors.map(error => ({ field: 'package', error })))
  }

  try {
    return adapter.updateMany('Package', filter, data as Record<string, unknown>)
  } catch (error) {
    if (error instanceof DBALError && error.code === 409) {
      throw DBALError.conflict('Package name+version already exists')
    }
    throw error
  }
}

export const deleteManyPackages = async (adapter: DBALAdapter, filter: Record<string, unknown>): Promise<number> => {
  if (!filter || Object.keys(filter).length === 0) {
    throw DBALError.validationError('Bulk delete requires a filter', [
      { field: 'filter', error: 'Filter is required' },
    ])
  }

  return adapter.deleteMany('Package', filter)
}
