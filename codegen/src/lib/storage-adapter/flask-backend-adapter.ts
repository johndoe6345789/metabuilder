import type { StorageAdapter } from './types'

export class FlaskBackendAdapter implements StorageAdapter {
  private baseUrl: string
  private isAvailable: boolean | null = null
  private readonly TIMEOUT_MS = 2000

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.TIMEOUT_MS}ms`)
      }
      throw error
    }
  }

  private async checkAvailability(): Promise<boolean> {
    if (this.isAvailable !== null) {
      return this.isAvailable
    }

    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      this.isAvailable = response.ok
      console.log('[StorageAdapter] Flask backend available:', this.isAvailable)
      return this.isAvailable
    } catch (error) {
      console.warn('[StorageAdapter] Flask backend not available:', error)
      this.isAvailable = false
      return false
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    if (!(await this.checkAvailability())) {
      throw new Error('Flask backend not available')
    }

    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/storage/${encodeURIComponent(key)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.status === 404) {
        return undefined
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.value as T
    } catch (error) {
      console.error(`[StorageAdapter] Error getting key ${key}:`, error)
      this.isAvailable = false
      throw error
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (!(await this.checkAvailability())) {
      throw new Error('Flask backend not available')
    }

    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/storage/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error(`[StorageAdapter] Error setting key ${key}:`, error)
      this.isAvailable = false
      throw error
    }
  }

  async delete(key: string): Promise<void> {
    if (!(await this.checkAvailability())) {
      throw new Error('Flask backend not available')
    }

    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/storage/${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.status === 404) {
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error(`[StorageAdapter] Error deleting key ${key}:`, error)
      this.isAvailable = false
      throw error
    }
  }

  async keys(): Promise<string[]> {
    if (!(await this.checkAvailability())) {
      throw new Error('Flask backend not available')
    }

    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/storage/keys`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.keys
    } catch (error) {
      console.error('[StorageAdapter] Error getting keys:', error)
      this.isAvailable = false
      throw error
    }
  }

  async clear(): Promise<void> {
    if (!(await this.checkAvailability())) {
      throw new Error('Flask backend not available')
    }

    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/storage/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('[StorageAdapter] Error clearing storage:', error)
      this.isAvailable = false
      throw error
    }
  }

  async export(): Promise<Record<string, any>> {
    if (!(await this.checkAvailability())) {
      throw new Error('Flask backend not available')
    }

    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/storage/export`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[StorageAdapter] Error exporting data:', error)
      this.isAvailable = false
      throw error
    }
  }

  async import(data: Record<string, any>): Promise<number> {
    if (!(await this.checkAvailability())) {
      throw new Error('Flask backend not available')
    }

    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/storage/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.imported
    } catch (error) {
      console.error('[StorageAdapter] Error importing data:', error)
      this.isAvailable = false
      throw error
    }
  }

  async getStats(): Promise<{ total_keys: number; total_size_bytes: number; database_path: string }> {
    if (!(await this.checkAvailability())) {
      throw new Error('Flask backend not available')
    }

    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/storage/stats`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[StorageAdapter] Error getting stats:', error)
      this.isAvailable = false
      throw error
    }
  }
}
