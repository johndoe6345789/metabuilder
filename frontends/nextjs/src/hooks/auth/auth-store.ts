/**
 * @file auth-store.ts
 * @description Authentication state management store
 *
 * All auth operations go through API routes to avoid importing
 * server-only modules into the client bundle.
 */

import type { User } from '@/lib/types/level-types'
import type { AuthState } from './auth-types'
import { mapUserToAuthUser } from './utils/map-user'
import { BASE_PATH } from '@/lib/app-config'

interface AuthApiResponse {
  success: boolean
  user: User | null
  error?: string
}

export class AuthStore {
  private state: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }

  private readonly listeners = new Set<() => void>()
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

  private setState(newState: AuthState): void {
    this.state = newState
    this.listeners.forEach(listener => { listener(); })
  }

  async ensureSessionChecked(): Promise<void> {
    this.sessionCheckPromise ??= this.refresh().finally(() => {
      this.sessionCheckPromise = null
    })
    return this.sessionCheckPromise
  }

  async login(identifier: string, password: string): Promise<void> {
    this.setState({
      ...this.state,
      isLoading: true,
    })

    try {
      const response = await fetch(`${BASE_PATH}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier, password }),
      })

      const result = await response.json() as AuthApiResponse

      if (!result.success || result.user === null) {
        this.setState({
          ...this.state,
          isLoading: false,
        })
        throw new Error(result.error ?? 'Login failed')
      }

      this.setState({
        user: mapUserToAuthUser(result.user),
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
      const response = await fetch(`${BASE_PATH}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password }),
      })

      const result = await response.json() as AuthApiResponse

      if (!result.success || result.user === null) {
        this.setState({
          ...this.state,
          isLoading: false,
        })
        throw new Error(result.error ?? 'Registration failed')
      }

      this.setState({
        user: mapUserToAuthUser(result.user),
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
    try {
      await fetch(`${BASE_PATH}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      this.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }

  async refresh(): Promise<void> {
    this.setState({
      ...this.state,
      isLoading: true,
    })

    try {
      const response = await fetch(`${BASE_PATH}/api/auth/session`, {
        credentials: 'include',
      })

      const result = await response.json() as { user: User | null }

      if (result.user !== null && result.user !== undefined) {
        this.setState({
          user: mapUserToAuthUser(result.user),
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        this.setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    } catch (error) {
      this.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
      console.error('Failed to refresh session', error)
    }
  }
}

export const authStore = new AuthStore()
