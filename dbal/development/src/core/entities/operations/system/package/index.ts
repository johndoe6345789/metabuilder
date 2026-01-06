import type { DBALAdapter } from '../../../../../adapters/adapter'
import type { Package, ListOptions, ListResult } from '../../../../foundation/types'
import { createManyPackages, deleteManyPackages, updateManyPackages } from './batch'
import { createPackage, deletePackage, updatePackage } from './mutations'
import { publishPackage } from './publish'
import { listPackages, readPackage } from './reads'
import { unpublishPackage } from './unpublish'
import { validatePackage } from './validate'

export interface PackageOperations {
  validate: (data: Partial<Package>) => string[]
  publish: (data: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Package>
  unpublish: (id: string) => Promise<boolean>
  create: (data: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Package>
  read: (id: string) => Promise<Package | null>
  update: (id: string, data: Partial<Package>) => Promise<Package>
  delete: (id: string) => Promise<boolean>
  list: (options?: ListOptions) => Promise<ListResult<Package>>
  createMany: (data: Array<Omit<Package, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<number>
  updateMany: (filter: Record<string, unknown>, data: Partial<Package>) => Promise<number>
  deleteMany: (filter: Record<string, unknown>) => Promise<number>
}

export const createPackageOperations = (adapter: DBALAdapter): PackageOperations => ({
  validate: data => validatePackage(data),
  publish: data => publishPackage(adapter, data),
  unpublish: id => unpublishPackage(adapter, id),
  create: data => createPackage(adapter, data),
  read: id => readPackage(adapter, id),
  update: (id, data) => updatePackage(adapter, id, data),
  delete: id => deletePackage(adapter, id),
  list: options => listPackages(adapter, options),
  createMany: data => createManyPackages(adapter, data),
  updateMany: (filter, data) => updateManyPackages(adapter, filter, data),
  deleteMany: filter => deleteManyPackages(adapter, filter),
})

export { publishPackage } from './publish'
export { unpublishPackage } from './unpublish'
export { validatePackage } from './validate'
