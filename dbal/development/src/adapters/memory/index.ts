import type { AdapterCapabilities, DBALAdapter } from '../adapter'
import type { ListOptions, ListResult } from '../../core/foundation/types'
import { DBALError } from '../../core/foundation/errors'

const ID_FIELDS: Record<string, string> = {
  Credential: 'username',
  InstalledPackage: 'packageId',
  PackageData: 'packageId',
}

const resolveIdField = (entity: string, data?: Record<string, unknown>): string => {
  if (ID_FIELDS[entity]) {
    return ID_FIELDS[entity]
  }
  if (data && typeof data.id === 'string' && data.id.trim().length > 0) {
    return 'id'
  }
  return 'id'
}

const getRecordId = (entity: string, data: Record<string, unknown>): string => {
  const idField = resolveIdField(entity, data)
  const value = data[idField]
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw DBALError.validationError(`${entity} ${idField} is required`, [
      { field: idField, error: `${idField} is required` },
    ])
  }
  return value
}

const applyFilter = (
  records: Record<string, unknown>[],
  filter?: Record<string, unknown>,
): Record<string, unknown>[] => {
  if (!filter || Object.keys(filter).length === 0) {
    return records
  }
  return records.filter((record) =>
    Object.entries(filter).every(([key, value]) => record[key] === value),
  )
}

const applySort = (
  records: Record<string, unknown>[],
  sort?: Record<string, 'asc' | 'desc'>,
): Record<string, unknown>[] => {
  if (!sort || Object.keys(sort).length === 0) {
    return records
  }
  const [key, direction] = Object.entries(sort)[0]
  return [...records].sort((left, right) => {
    const a = left[key]
    const b = right[key]
    if (typeof a === 'string' && typeof b === 'string') {
      return direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
    }
    if (typeof a === 'number' && typeof b === 'number') {
      return direction === 'asc' ? a - b : b - a
    }
    if (typeof a === 'bigint' && typeof b === 'bigint') {
      return direction === 'asc' ? Number(a - b) : Number(b - a)
    }
    if (typeof a === 'boolean' && typeof b === 'boolean') {
      return direction === 'asc' ? Number(a) - Number(b) : Number(b) - Number(a)
    }
    return 0
  })
}

export class MemoryAdapter implements DBALAdapter {
  private store: Map<string, Map<string, Record<string, unknown>>> = new Map()

  private getEntityStore(entity: string): Map<string, Record<string, unknown>> {
    const existing = this.store.get(entity)
    if (existing) return existing
    const created = new Map<string, Record<string, unknown>>()
    this.store.set(entity, created)
    return created
  }

  async create(entity: string, data: Record<string, unknown>): Promise<unknown> {
    const entityStore = this.getEntityStore(entity)
    const id = getRecordId(entity, data)
    if (entityStore.has(id)) {
      throw DBALError.conflict(`${entity} already exists: ${id}`)
    }
    const record = { ...data }
    entityStore.set(id, record)
    return record
  }

  async read(entity: string, id: string): Promise<unknown | null> {
    const entityStore = this.getEntityStore(entity)
    return entityStore.get(id) ?? null
  }

  async update(entity: string, id: string, data: Record<string, unknown>): Promise<unknown> {
    const entityStore = this.getEntityStore(entity)
    const existing = entityStore.get(id)
    if (!existing) {
      throw DBALError.notFound(`${entity} not found: ${id}`)
    }
    const record = { ...existing, ...data }
    entityStore.set(id, record)
    return record
  }

  async delete(entity: string, id: string): Promise<boolean> {
    const entityStore = this.getEntityStore(entity)
    return entityStore.delete(id)
  }

  async list(entity: string, options?: ListOptions): Promise<ListResult<unknown>> {
    const entityStore = this.getEntityStore(entity)
    const page = options?.page ?? 1
    const limit = options?.limit ?? 20
    const filtered = applyFilter(Array.from(entityStore.values()), options?.filter)
    const sorted = applySort(filtered, options?.sort)
    const start = (page - 1) * limit
    const data = sorted.slice(start, start + limit)
    return {
      data,
      total: filtered.length,
      page,
      limit,
      hasMore: start + limit < filtered.length,
    }
  }

  async findFirst(entity: string, filter?: Record<string, unknown>): Promise<unknown | null> {
    const entityStore = this.getEntityStore(entity)
    const result = applyFilter(Array.from(entityStore.values()), filter)
    return result[0] ?? null
  }

  async findByField(entity: string, field: string, value: unknown): Promise<unknown | null> {
    return this.findFirst(entity, { [field]: value })
  }

  async upsert(
    entity: string,
    uniqueField: string,
    uniqueValue: unknown,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>,
  ): Promise<unknown> {
    const entityStore = this.getEntityStore(entity)
    const existing = Array.from(entityStore.entries()).find(([, record]) => record[uniqueField] === uniqueValue)
    if (existing) {
      const [id, record] = existing
      const next = { ...record, ...updateData }
      entityStore.set(id, next)
      return next
    }
    const payload = { ...createData, [uniqueField]: uniqueValue }
    return this.create(entity, payload)
  }

  async updateByField(
    entity: string,
    field: string,
    value: unknown,
    data: Record<string, unknown>,
  ): Promise<unknown> {
    const entityStore = this.getEntityStore(entity)
    const entry = Array.from(entityStore.entries()).find(([, record]) => record[field] === value)
    if (!entry) {
      throw DBALError.notFound(`${entity} not found`)
    }
    const [id, record] = entry
    const next = { ...record, ...data }
    entityStore.set(id, next)
    return next
  }

  async deleteByField(entity: string, field: string, value: unknown): Promise<boolean> {
    const entityStore = this.getEntityStore(entity)
    const entry = Array.from(entityStore.entries()).find(([, record]) => record[field] === value)
    if (!entry) {
      return false
    }
    return entityStore.delete(entry[0])
  }

  async deleteMany(entity: string, filter?: Record<string, unknown>): Promise<number> {
    const entityStore = this.getEntityStore(entity)
    const candidates = Array.from(entityStore.entries()).filter(([, record]) =>
      Object.entries(filter ?? {}).every(([key, value]) => record[key] === value),
    )
    let deleted = 0
    for (const [id] of candidates) {
      if (entityStore.delete(id)) {
        deleted += 1
      }
    }
    return deleted
  }

  async createMany(entity: string, data: Record<string, unknown>[]): Promise<number> {
    if (!data || data.length === 0) return 0
    const entityStore = this.getEntityStore(entity)
    const records = data.map((item) => ({ id: getRecordId(entity, item), record: { ...item } }))
    for (const { id } of records) {
      if (entityStore.has(id)) {
        throw DBALError.conflict(`${entity} already exists: ${id}`)
      }
    }
    records.forEach(({ id, record }) => {
      entityStore.set(id, record)
    })
    return records.length
  }

  async updateMany(
    entity: string,
    filter: Record<string, unknown>,
    data: Record<string, unknown>,
  ): Promise<number> {
    const entityStore = this.getEntityStore(entity)
    const entries = Array.from(entityStore.entries())
    const matches = entries.filter(([, record]) =>
      Object.entries(filter).every(([key, value]) => record[key] === value),
    )
    matches.forEach(([id, record]) => {
      entityStore.set(id, { ...record, ...data })
    })
    return matches.length
  }

  getCapabilities(): Promise<AdapterCapabilities> {
    return Promise.resolve({
      transactions: false,
      joins: false,
      fullTextSearch: false,
      ttl: false,
      jsonQueries: false,
      aggregations: false,
      relations: false,
    })
  }

  async close(): Promise<void> {
    this.store.clear()
  }
}
