/**
 * Register API (stub)
 */

export interface RegisterData {
  username: string
  email: string
  password: string
}

export interface RegisterResponse {
  success: boolean
  userId?: string
  error?: string
}

export async function register(_data: RegisterData): Promise<RegisterResponse> {
  // TODO: Implement registration
  return { success: false, error: 'Not implemented' }
}
