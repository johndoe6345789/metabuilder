import { toEntityName } from './to-entity-name'
import { createOps } from './create-ops'
import type { DBALClient, EntityOps } from './types'

const cache = new Map<string, EntityOps>()

function getOps(name: string): EntityOps {
  const entity = toEntityName(name)
  let ops = cache.get(entity)
  if (ops == null) {
    ops = createOps(entity)
    cache.set(entity, ops)
  }
  return ops
}

export const db: DBALClient = new Proxy({} as DBALClient, {
  get(_target, prop: string | symbol) {
    if (typeof prop === 'symbol') return undefined
    if (prop === 'entity') {
      return (name: string, tenantId?: string) => createOps(name, tenantId)
    }
    return getOps(prop)
  },
})

export function getDB(): DBALClient {
  return db
}
