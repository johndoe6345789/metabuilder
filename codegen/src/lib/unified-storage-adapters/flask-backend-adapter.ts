import type { StorageAdapter } from './types'

export class FlaskBackendAdapter implements StorageAdapter {
  private baseUrl: string
  private readonly TIMEOUT_MS = 2000

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || localStorage.getItem('codeforge-flask-url') || import.meta.env.VITE_FLASK_BACKEND_URL || 'http://localhost:5001'
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS)

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const contentLength = response.headers.get('content-length')
      const contentType = response.headers.get('content-type')
      const hasJsonBody = contentLength !== '0' && contentType?.includes('application/json')

      if (!response.ok) {
        const errorPayload = hasJsonBody ? await response.json().catch(() => null) : null
        const errorMessage = errorPayload?.error || response.statusText || `HTTP ${response.status}`
        throw new Error(errorMessage)
      }

      if (response.status === 204 || !hasJsonBody) {
        return undefined as T
      }

      const responseText = await response.text()
      if (!responseText) {
        return undefined as T
      }
      return JSON.parse(responseText) as T
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.TIMEOUT_MS}ms`)
      }
      throw error
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const result = await this.request<{ value: T }>(`/api/storage/${encodeURIComponent(key)}`)
      return result.value
    } catch (error: any) {
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        return undefined
      }
      throw error
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.request(`/api/storage/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    })
  }

  async delete(key: string): Promise<void> {
    await this.request(`/api/storage/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    })
  }

  async keys(): Promise<string[]> {
    const result = await this.request<{ keys: string[] }>('/api/storage/keys')
    return result.keys
  }

  async clear(): Promise<void> {
    await this.request('/api/storage/clear', {
      method: 'POST',
    })
  }
}
