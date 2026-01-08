import type { User as GeneratedUser } from '../types.generated'

export type UserRole = 'public' | 'user' | 'moderator' | 'admin' | 'god' | 'supergod'

export type User = GeneratedUser

export interface CreateUserInput {
  [key: string]: unknown
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
  [key: string]: unknown
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
