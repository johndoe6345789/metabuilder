export interface User {
  id: string
  tenantId: string
  username: string
  email: string
  role: 'user' | 'admin' | 'god' | 'supergod'
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserInput {
  tenantId?: string
  username: string
  email: string
  role?: User['role']
}

export interface UpdateUserInput {
  tenantId?: string
  username?: string
  email?: string
  role?: User['role']
}
