/**
 * Login API (stub)
 */

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  token?: string
  error?: string
}

export async function login(_credentials: LoginCredentials): Promise<LoginResponse> {
  // TODO: Implement login
  return { success: false, error: 'Not implemented' }
}
