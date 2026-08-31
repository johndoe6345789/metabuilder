import { DBAL_URL, TENANT, PACKAGE } from './config'
import type { EntityOps } from './types'
import { listEntity } from './entity-ops/list'
import { readEntity } from './entity-ops/read'
import { createEntity, updateEntity } from './entity-ops/write'
import { removeEntity } from './entity-ops/remove'

export function createOps(entityName: string): EntityOps {
  const base = `${DBAL_URL}/${TENANT}/${PACKAGE}/${entityName}`

  return {
    list: options => listEntity(base, options),
    read: id => readEntity(base, id),
    create: data => createEntity(base, data),
    update: (id, data) => updateEntity(base, id, data),
    remove: id => removeEntity(base, id),
  }
}
