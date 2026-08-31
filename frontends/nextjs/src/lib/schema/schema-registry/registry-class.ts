import type { ModelSchema } from '../../types/schema-types'

/** In-memory index of registered model schemas, plus the loose
 *  package/migration state that travels alongside them on disk. */
export class SchemaRegistry {
  private readonly schemas: Map<string, ModelSchema> = new Map()
  packages: Record<string, unknown> = {}
  migrationQueue: unknown[] = []

  clear(): void {
    this.schemas.clear()
    this.packages = {}
    this.migrationQueue = []
  }

  register(schema: ModelSchema): void {
    this.schemas.set(schema.id, schema)
  }

  get(key: string): ModelSchema | undefined {
    const direct = this.schemas.get(key)
    if (direct !== undefined) return direct

    return Array.from(this.schemas.values()).find(
      schema => schema.name === key
    )
  }

  has(key: string): boolean {
    return this.schemas.has(key)
  }

  getAll(): ModelSchema[] {
    return Array.from(this.schemas.values())
  }
}

export const schemaRegistry = new SchemaRegistry()
