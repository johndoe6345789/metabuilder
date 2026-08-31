export interface ListResult<T = Record<string, unknown>> {
  data: T[]
  total?: number
}

export interface ListOptions {
  filter?: Record<string, unknown>
  limit?: number
  offset?: number
}

export interface EntityOps {
  list(options?: ListOptions): Promise<ListResult>
  read(id: string): Promise<Record<string, unknown> | null>
  create(data: Record<string, unknown>): Promise<Record<string, unknown>>
  update(
    id: string,
    data: Record<string, unknown>
  ): Promise<Record<string, unknown>>
  remove(id: string): Promise<boolean>
}

export interface DBALClient {
  users: EntityOps
  sessions: EntityOps
  workflows: EntityOps
  packages: EntityOps
  packageData: EntityOps
  pageConfigs: EntityOps
  installedPackages: EntityOps
  credentials: EntityOps
  entity(name: string): EntityOps
}
