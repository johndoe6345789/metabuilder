import type { DBALAdapter } from '../../../../../adapters/adapter'
import type { InstalledPackage } from '../../../../foundation/types'
import { createInstalledPackage } from './mutations'

export const publishPackage = (
  adapter: DBALAdapter,
  data: InstalledPackage,
): Promise<InstalledPackage> => {
  return createInstalledPackage(adapter, data)
}
