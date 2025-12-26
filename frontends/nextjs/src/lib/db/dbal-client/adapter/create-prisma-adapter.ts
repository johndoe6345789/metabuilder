import type { DBALAdapter } from '../types'
import { closeConnection } from './close-connection'
import { createEntity } from '../crud/write/create-entity'
import { deleteEntity } from '../crud/write/delete-entity'
import { findFirstEntity } from '../crud/read/find-first-entity'
import { listEntities } from '../crud/read/list-entities'
import { readEntity } from '../crud/read/read-entity'
import { updateEntity } from '../crud/write/update-entity'
import { upsertEntity } from '../crud/write/upsert-entity'

/**
 * DBAL Adapter implementation using Prisma
 */
export const prismaAdapter: DBALAdapter = {
  create: createEntity,
  read: readEntity,
  update: updateEntity,
  delete: deleteEntity,
  list: listEntities,
  findFirst: findFirstEntity,
  upsert: upsertEntity,
  close: closeConnection,
}
