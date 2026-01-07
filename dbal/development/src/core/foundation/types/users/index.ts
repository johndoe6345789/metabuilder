export type UserRole = 'public' | 'user' | 'moderator' | 'admin' | 'god' | 'supergod'

export interface User {
  id: string
  username: string
  email: string
  role: UserRole
  profilePicture?: string | null
  bio?: string | null
  createdAt: bigint
  tenantId?: string | null
  isInstanceOwner: boolean
  passwordChangeTimestamp?: bigint | null
  firstLogin: boolean
}

export interface CreateUserInput {
  id?: string
  username: string
  email: string
  role: UserRole
  profilePicture?: string | null
  bio?: string | null
  createdAt?: bigint
  tenantId?: string | null
  isInstanceOwner?: boolean
  passwordChangeTimestamp?: bigint | null
  firstLogin?: boolean
}

export interface UpdateUserInput {
  username?: string
  email?: string
  role?: UserRole
  profilePicture?: string | null
  bio?: string | null
  tenantId?: string | null
  isInstanceOwner?: boolean
  passwordChangeTimestamp?: bigint | null
  firstLogin?: boolean
}
