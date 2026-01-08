/**
 * @file auth-store.ts
 * @description Authentication state management store
 */

import { fetchSession } from '@/lib/auth/api/fetch-session'
import { login as loginRequest } from '@/lib/auth/api/login'
import { logout as logoutRequest } from '@/lib/auth/api/logout'
import { register as registerRequest } from '@/lib/auth/api/register'

import type { AuthState } from './auth-types'
import { mapUserToAuthUser } from './utils/map-user'

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
      const result = await loginRequest(identifier, password)
      
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
      const result = await registerRequest(username, email, password)
      
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
      await logoutRequest()
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
      const user = await fetchSession()
      if (user !== null && user !== undefined) {
        this.setState({
          user: mapUserToAuthUser(user),
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
