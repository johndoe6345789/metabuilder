import type { DBALAdapter } from '../../../../../adapters/adapter'
import { deletePackage } from './mutations'

export const unpublishPackage = (adapter: DBALAdapter, id: string): Promise<boolean> => {
  return deletePackage(adapter, id)
}
