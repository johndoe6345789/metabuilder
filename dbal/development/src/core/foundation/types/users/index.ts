export interface User {
  id: string
  username: string
  email: string
  role: 'user' | 'admin' | 'god' | 'supergod'
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserInput {
  username: string
  email: string
  role?: User['role']
}

export interface UpdateUserInput {
  username?: string
  email?: string
  role?: User['role']
}
