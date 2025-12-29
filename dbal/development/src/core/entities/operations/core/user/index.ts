import type { DBALAdapter } from '../../../../adapters/adapter'
import type { User, ListOptions, ListResult } from '../../../../foundation/types'
import { createUser } from './create'
import { deleteUser } from './delete'
import { updateUser } from './update'
import { createManyUsers, deleteManyUsers, updateManyUsers } from './batch'
import { listUsers, readUser } from './reads'

export interface UserOperations {
  create: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<User>
  read: (id: string) => Promise<User | null>
  update: (id: string, data: Partial<User>) => Promise<User>
  delete: (id: string) => Promise<boolean>
  list: (options?: ListOptions) => Promise<ListResult<User>>
  createMany: (data: Array<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<number>
  updateMany: (filter: Record<string, unknown>, data: Partial<User>) => Promise<number>
  deleteMany: (filter: Record<string, unknown>) => Promise<number>
}

export const createUserOperations = (adapter: DBALAdapter): UserOperations => ({
  create: data => createUser(adapter, data),
  read: id => readUser(adapter, id),
  update: (id, data) => updateUser(adapter, id, data),
  delete: id => deleteUser(adapter, id),
  list: options => listUsers(adapter, options),
  createMany: data => createManyUsers(adapter, data),
  updateMany: (filter, data) => updateManyUsers(adapter, filter, data),
  deleteMany: filter => deleteManyUsers(adapter, filter),
})
