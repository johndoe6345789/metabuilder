import type { DBALAdapter } from '../../../../adapters/adapter'
import type { Package } from '../../../../foundation/types'
import { createPackage } from './mutations'

export const publishPackage = (
  adapter: DBALAdapter,
  data: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Package> => {
  return createPackage(adapter, data)
}
