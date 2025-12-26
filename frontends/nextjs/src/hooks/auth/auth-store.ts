import type { User } from '@/lib/level-types'
import { fetchSession } from '@/lib/auth/api/fetch-session'
import { login as loginRequest } from '@/lib/auth/api/login'
import { logout as logoutRequest } from '@/lib/auth/api/logout'
import { register as registerRequest } from '@/lib/auth/api/register'
import type { AuthState, AuthUser } from './auth-types'

const roleLevels: Record<string, number> = {
  public: 1,
  user: 2,
  admin: 3,
  god: 4,
  supergod: 5,
}

export class AuthStore {
  private state: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }

  private listeners = new Set<() => void>()
  private sessionCheckPromise: Promise<void> | null = null

  getState(): AuthState {
    return this.state
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  async ensureSessionChecked(): Promise<void> {
    if (!this.sessionCheckPromise) {
      this.sessionCheckPromise = this.refresh().finally(() => {
        this.sessionCheckPromise = null
      })
    }
    return this.sessionCheckPromise
  }

  async login(identifier: string, password: string): Promise<void> {
    this.setState({
      ...this.state,
      isLoading: true,
    })

    try {
      const user = await loginRequest(identifier, password)
      this.setState({
        user: this.mapUserToAuthUser(user),
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
      })
      throw error
    }
  }

  async register(username: string, email: string, password: string): Promise<void> {
    this.setState({
      ...this.state,
      isLoading: true,
    })

    try {
      const user = await registerRequest(username, email, password)
      this.setState({
        user: this.mapUserToAuthUser(user),
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
      })
      throw error
    }
  }

  async logout(): Promise<void> {
    this.setState({
      ...this.state,
      isLoading: true,
    })

    try {
      await logoutRequest()
      this.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
      })
      throw error
    }
  }

  async refresh(): Promise<void> {
    this.setState({
      ...this.state,
      isLoading: true,
    })

    try {
      const sessionUser = await fetchSession()
      this.setState({
        user: sessionUser ? this.mapUserToAuthUser(sessionUser) : null,
        isAuthenticated: Boolean(sessionUser),
        isLoading: false,
      })
    } catch (error) {
      console.error('Failed to refresh auth session:', error)
      this.setState({
        ...this.state,
        isLoading: false,
      })
    }
  }

  private mapUserToAuthUser(user: User): AuthUser {
    const level = roleLevels[user.role]
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.username,
      role: user.role,
      level,
      tenantId: user.tenantId,
      profilePicture: user.profilePicture,
      bio: user.bio,
      isInstanceOwner: user.isInstanceOwner,
    }
  }

  private setState(next: AuthState): void {
    this.state = next
    this.listeners.forEach((listener) => listener())
  }
}

export const authStore = new AuthStore()
