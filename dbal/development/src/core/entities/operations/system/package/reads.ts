import type { DBALAdapter } from '../../../../../adapters/adapter'
import type { InstalledPackage, ListOptions, ListResult } from '../../../../foundation/types'
import { DBALError } from '../../../../foundation/errors'
import { validateId } from '../../../../foundation/validation'

export const readInstalledPackage = async (
  adapter: DBALAdapter,
  packageId: string,
): Promise<InstalledPackage | null> => {
  const validationErrors = validateId(packageId)
  if (validationErrors.length > 0) {
    throw DBALError.validationError('Invalid package ID', validationErrors.map(error => ({ field: 'packageId', error })))
  }

  const result = await adapter.read('InstalledPackage', packageId) as InstalledPackage | null
  if (!result) {
    throw DBALError.notFound(`Installed package not found: ${packageId}`)
  }
  return result
}

export const listInstalledPackages = (
  adapter: DBALAdapter,
  options?: ListOptions,
): Promise<ListResult<InstalledPackage>> => {
  return adapter.list('InstalledPackage', options) as Promise<ListResult<InstalledPackage>>
}
