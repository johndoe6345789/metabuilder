export interface ListResult<T = Record<string, unknown>> {
  data: T[]
  total?: number
  /**
   * True when the list could not be read at all, as opposed to having
   * read it and found nothing.
   *
   * listEntity swallows its errors into an empty list on purpose -- a page
   * list going briefly blank during an outage beats a crash. But a caller
   * using a list as a *guard* needs the two apart: registration's "is this
   * community name taken" check read a DBAL timeout as "nobody has it"
   * and created the account as a god inside somebody else's tenant.
   *
   * Absent or false means the answer is real. Anything deciding whether
   * to permit something must refuse when this is true.
   */
  failed?: boolean
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
  entity(name: string, tenantId?: string): EntityOps
}
