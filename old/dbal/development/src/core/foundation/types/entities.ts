export type EntityId = string

export interface BaseEntity {
  id: EntityId
  createdAt: Date
  updatedAt: Date
}

export interface SoftDeletableEntity extends BaseEntity {
  deletedAt?: Date
}

export interface TenantScopedEntity extends BaseEntity {
  tenantId?: string | null
}

export interface EntityMetadata {
  metadata?: Record<string, unknown>
}
