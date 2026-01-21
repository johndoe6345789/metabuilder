import type { DBALAdapter } from '../../../../../adapters/adapter'
import type { InstalledPackage } from '../../../../foundation/types'
import { DBALError } from '../../../../foundation/errors'
import { validatePackageCreate, validatePackageUpdate } from '../../../../foundation/validation'

export const createManyInstalledPackages = async (
  adapter: DBALAdapter,
  data: InstalledPackage[],
): Promise<number> => {
  if (!data || data.length === 0) {
    return 0
  }

  const validationErrors = data.flatMap((item, index) =>
    validatePackageCreate(item).map(error => ({ field: `packages[${index}]`, error })),
  )
  if (validationErrors.length > 0) {
    throw DBALError.validationError('Invalid installed package batch', validationErrors)
  }

  try {
    return adapter.createMany('InstalledPackage', data as unknown as Record<string, unknown>[])
  } catch (error) {
    if (error instanceof DBALError && error.code === 409) {
      throw DBALError.conflict('Installed package already exists')
    }
    throw error
  }
}

export const updateManyInstalledPackages = async (
  adapter: DBALAdapter,
  filter: Record<string, unknown>,
  data: Partial<InstalledPackage>,
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
    throw DBALError.validationError(
      'Invalid installed package update data',
      validationErrors.map(error => ({ field: 'package', error })),
    )
  }

  try {
    return adapter.updateMany('InstalledPackage', filter, data as unknown as Record<string, unknown>)
  } catch (error) {
    if (error instanceof DBALError && error.code === 409) {
      throw DBALError.conflict('Installed package already exists')
    }
    throw error
  }
}

export const deleteManyInstalledPackages = async (
  adapter: DBALAdapter,
  filter: Record<string, unknown>,
): Promise<number> => {
  if (!filter || Object.keys(filter).length === 0) {
    throw DBALError.validationError('Bulk delete requires a filter', [
      { field: 'filter', error: 'Filter is required' },
    ])
  }

  return adapter.deleteMany('InstalledPackage', filter)
}
