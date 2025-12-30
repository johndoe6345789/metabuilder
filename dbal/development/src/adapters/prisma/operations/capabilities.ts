import type { AdapterCapabilities } from '../adapter'
import type { PrismaContext } from '../types'

export function buildCapabilities(context: PrismaContext): AdapterCapabilities {
  const fullTextSearch = context.dialect === 'postgres' || context.dialect === 'mysql'

  return {
    transactions: true,
    joins: true,
    fullTextSearch,
    ttl: false,
    jsonQueries: true,
    aggregations: true,
    relations: true,
  }
}
