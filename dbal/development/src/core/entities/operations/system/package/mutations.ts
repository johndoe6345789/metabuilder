import type { DBALAdapter } from '../../../../../adapters/adapter'
import type { InstalledPackage } from '../../../../foundation/types'
import { DBALError } from '../../../../foundation/errors'
import { validatePackageCreate, validatePackageUpdate, validateId } from '../../../../foundation/validation'

export const createInstalledPackage = async (
  adapter: DBALAdapter,
  data: InstalledPackage,
): Promise<InstalledPackage> => {
  const validationErrors = validatePackageCreate(data)
  if (validationErrors.length > 0) {
    throw DBALError.validationError(
      'Invalid installed package data',
      validationErrors.map(error => ({ field: 'package', error })),
    )
  }

  try {
    return adapter.create('InstalledPackage', data as unknown as Record<string, unknown>) as Promise<InstalledPackage>
  } catch (error) {
    if (error instanceof DBALError && error.code === 409) {
      throw DBALError.conflict(`Installed package ${data.packageId} already exists`)
    }
    throw error
  }
}

export const updateInstalledPackage = async (
  adapter: DBALAdapter,
  packageId: string,
  data: Partial<InstalledPackage>,
): Promise<InstalledPackage> => {
  const idErrors = validateId(packageId)
  if (idErrors.length > 0) {
    throw DBALError.validationError('Invalid package ID', idErrors.map(error => ({ field: 'packageId', error })))
  }

  const validationErrors = validatePackageUpdate(data)
  if (validationErrors.length > 0) {
    throw DBALError.validationError(
      'Invalid installed package update data',
      validationErrors.map(error => ({ field: 'package', error })),
    )
  }

  try {
    return adapter.update('InstalledPackage', packageId, data as unknown as Record<string, unknown>) as Promise<InstalledPackage>
  } catch (error) {
    if (error instanceof DBALError && error.code === 409) {
      throw DBALError.conflict('Installed package already exists')
    }
    throw error
  }
}

export const deleteInstalledPackage = async (
  adapter: DBALAdapter,
  packageId: string,
): Promise<boolean> => {
  const validationErrors = validateId(packageId)
  if (validationErrors.length > 0) {
    throw DBALError.validationError('Invalid package ID', validationErrors.map(error => ({ field: 'packageId', error })))
  }

  const result = await adapter.delete('InstalledPackage', packageId)
  if (!result) {
    throw DBALError.notFound(`Installed package not found: ${packageId}`)
  }
  return result
}
