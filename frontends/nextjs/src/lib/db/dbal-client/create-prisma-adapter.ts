import type { DBALAdapter } from './types'
import { closeConnection } from './close-connection'
import { createEntity } from './create-entity'
import { deleteEntity } from './delete-entity'
import { findFirstEntity } from './find-first-entity'
import { listEntities } from './list-entities'
import { readEntity } from './read-entity'
import { updateEntity } from './update-entity'
import { upsertEntity } from './upsert-entity'

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
