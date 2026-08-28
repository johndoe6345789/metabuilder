/** Shapes the credentials tab reads back from DBAL. */

export type CredentialRecord = {
  username: string
  tenantId?: string | null
  salt?: string
}

export type TenantRecord = {
  id: string
  name?: string
  slug?: string
}

export type UserRecord = {
  username?: string
  role?: string
  tenantId?: string | null
}

export type Notice = {
  kind: 'success' | 'error' | 'info'
  message: string
}
