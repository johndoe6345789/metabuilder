import type { DBALAdapter } from '../../../../../adapters/adapter'
import { deleteInstalledPackage } from './mutations'

export const unpublishPackage = (adapter: DBALAdapter, id: string): Promise<boolean> => {
  return deleteInstalledPackage(adapter, id)
}
