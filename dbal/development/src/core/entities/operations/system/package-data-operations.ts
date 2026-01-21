/**
 * @file package-data-operations.ts
 * @description PackageData entity CRUD operations for DBAL client
 */

import type { DBALAdapter } from '../../../../adapters/adapter'
import type { CreatePackageDataInput, ListOptions, ListResult, PackageData, UpdatePackageDataInput } from '../../../foundation/types'
import { DBALError } from '../../../foundation/errors'
import { isValidJsonString, validateId } from '../../../foundation/validation'

export interface PackageDataOperations {
  create: (data: CreatePackageDataInput) => Promise<PackageData>
  read: (packageId: string) => Promise<PackageData | null>
  update: (packageId: string, data: UpdatePackageDataInput) => Promise<PackageData>
  delete: (packageId: string) => Promise<boolean>
  list: (options?: ListOptions) => Promise<ListResult<PackageData>>
}

const assertValidId = (packageId: string) => {
  const errors = validateId(packageId)
  if (errors.length > 0) {
    throw DBALError.validationError('Invalid package ID', errors.map(error => ({ field: 'packageId', error })))
  }
}

const assertValidData = (data: { data?: string }) => {
  if (!data.data || typeof data.data !== 'string' || !isValidJsonString(data.data)) {
    throw DBALError.validationError('Invalid package data', [{ field: 'data', error: 'data must be a JSON string' }])
  }
}

export const createPackageDataOperations = (adapter: DBALAdapter): PackageDataOperations => ({
  create: async data => {
    assertValidId(data.packageId)
    assertValidData(data)
    return adapter.create('PackageData', data as unknown as Record<string, unknown>) as Promise<PackageData>
  },
  read: async packageId => {
    assertValidId(packageId)
    const result = await adapter.read('PackageData', packageId) as PackageData | null
    if (!result) {
      throw DBALError.notFound(`Package data not found: ${packageId}`)
    }
    return result
  },
  update: async (packageId, data) => {
    assertValidId(packageId)
    if (data.data !== undefined) {
      assertValidData({ data: data.data })
    }
    return adapter.update('PackageData', packageId, data as unknown as Record<string, unknown>) as Promise<PackageData>
  },
  delete: async packageId => {
    assertValidId(packageId)
    const result = await adapter.delete('PackageData', packageId)
    if (!result) {
      throw DBALError.notFound(`Package data not found: ${packageId}`)
    }
    return result
  },
  list: options => {
    return adapter.list('PackageData', options) as Promise<ListResult<PackageData>>
  },
})
