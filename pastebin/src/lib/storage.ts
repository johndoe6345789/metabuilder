import type { Snippet } from './types'

export type StorageBackend = 'indexeddb' | 'flask'

export interface StorageConfig {
  backend: StorageBackend
  flaskUrl?: string
}

const STORAGE_CONFIG_KEY = 'codesnippet-storage-config'

function getDefaultConfig(): StorageConfig {
  const flaskUrl = process.env.NEXT_PUBLIC_FLASK_BACKEND_URL
  
  if (flaskUrl) {
    return {
      backend: 'flask',
      flaskUrl: flaskUrl
    }
  }
  
  return {
    backend: 'indexeddb'
  }
}

let currentConfig: StorageConfig = getDefaultConfig()

export function loadStorageConfig(): StorageConfig {
  const defaultConfig = getDefaultConfig()
  
  if (defaultConfig.backend === 'flask' && defaultConfig.flaskUrl) {
    currentConfig = defaultConfig
    return currentConfig
  }
  
  try {
    const saved = localStorage.getItem(STORAGE_CONFIG_KEY)
    if (saved) {
      currentConfig = JSON.parse(saved)
    }
  } catch (error) {
    console.warn('Failed to load storage config:', error)
  }
  return currentConfig
}

export function saveStorageConfig(config: StorageConfig): void {
  currentConfig = config
  try {
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config))
  } catch (error) {
    console.warn('Failed to save storage config:', error)
  }
}

export function getStorageConfig(): StorageConfig {
  return currentConfig
}

export class FlaskStorageAdapter {
  private baseUrl: string

  constructor(baseUrl: string) {
    if (!baseUrl || baseUrl.trim() === '') {
      throw new Error('Flask backend URL cannot be empty')
    }
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  private isValidUrl(): boolean {
    try {
      new URL(this.baseUrl)
      return true
    } catch {
      return false
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.isValidUrl()) {
      return false
    }

    try {
      const url = new URL('/health', this.baseUrl)
      const response = await fetch(url.toString(), {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      return response.ok
    } catch {
      return false
    }
  }

  async getAllSnippets(): Promise<Snippet[]> {
    if (!this.isValidUrl()) {
      throw new Error('Invalid Flask backend URL')
    }
    const response = await fetch(`${this.baseUrl}/api/snippets`)
    if (!response.ok) {
      throw new Error(`Failed to fetch snippets: ${response.statusText}`)
    }
    const data: Snippet[] = await response.json()
    return data.map((s) => ({
      ...s,
      createdAt: typeof s.createdAt === 'string' ? new Date(s.createdAt).getTime() : s.createdAt,
      updatedAt: typeof s.updatedAt === 'string' ? new Date(s.updatedAt).getTime() : s.updatedAt
    }))
  }

  async getSnippet(id: string): Promise<Snippet | null> {
    if (!this.isValidUrl()) {
      throw new Error('Invalid Flask backend URL')
    }
    const response = await fetch(`${this.baseUrl}/api/snippets/${id}`)
    if (response.status === 404) {
      return null
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch snippet: ${response.statusText}`)
    }
    const data = await response.json()
    return {
      ...data,
      createdAt: typeof data.createdAt === 'string' ? new Date(data.createdAt).getTime() : data.createdAt,
      updatedAt: typeof data.updatedAt === 'string' ? new Date(data.updatedAt).getTime() : data.updatedAt
    }
  }

  async createSnippet(snippet: Snippet): Promise<void> {
    if (!this.isValidUrl()) {
      throw new Error('Invalid Flask backend URL')
    }
    const response = await fetch(`${this.baseUrl}/api/snippets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...snippet,
        createdAt: new Date(snippet.createdAt).toISOString(),
        updatedAt: new Date(snippet.updatedAt).toISOString()
      })
    })
    if (!response.ok) {
      throw new Error(`Failed to create snippet: ${response.statusText}`)
    }
  }

  async updateSnippet(snippet: Snippet): Promise<void> {
    if (!this.isValidUrl()) {
      throw new Error('Invalid Flask backend URL')
    }
    const response = await fetch(`${this.baseUrl}/api/snippets/${snippet.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...snippet,
        createdAt: new Date(snippet.createdAt).toISOString(),
        updatedAt: new Date(snippet.updatedAt).toISOString()
      })
    })
    if (!response.ok) {
      throw new Error(`Failed to update snippet: ${response.statusText}`)
    }
  }

  async deleteSnippet(id: string): Promise<void> {
    if (!this.isValidUrl()) {
      throw new Error('Invalid Flask backend URL')
    }
    const response = await fetch(`${this.baseUrl}/api/snippets/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      throw new Error(`Failed to delete snippet: ${response.statusText}`)
    }
  }

  async migrateFromIndexedDB(snippets: Snippet[]): Promise<void> {
    for (const snippet of snippets) {
      await this.createSnippet(snippet)
    }
  }

  async migrateToIndexedDB(): Promise<Snippet[]> {
    return this.getAllSnippets()
  }

  async getAllNamespaces(): Promise<import('./types').Namespace[]> {
    if (!this.isValidUrl()) {
      throw new Error('Invalid Flask backend URL')
    }
    const response = await fetch(`${this.baseUrl}/api/namespaces`)
    if (!response.ok) {
      throw new Error(`Failed to fetch namespaces: ${response.statusText}`)
    }
    return await response.json()
  }

  async createNamespace(namespace: import('./types').Namespace): Promise<void> {
    if (!this.isValidUrl()) {
      throw new Error('Invalid Flask backend URL')
    }
    const response = await fetch(`${this.baseUrl}/api/namespaces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(namespace)
    })
    if (!response.ok) {
      throw new Error(`Failed to create namespace: ${response.statusText}`)
    }
  }

  async deleteNamespace(id: string): Promise<void> {
    if (!this.isValidUrl()) {
      throw new Error('Invalid Flask backend URL')
    }
    const response = await fetch(`${this.baseUrl}/api/namespaces/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      throw new Error(`Failed to delete namespace: ${response.statusText}`)
    }
  }

  async wipeDatabase(): Promise<void> {
    if (!this.isValidUrl()) {
      throw new Error('Invalid Flask backend URL')
    }
    const response = await fetch(`${this.baseUrl}/api/wipe`, {
      method: 'POST'
    })
    if (!response.ok) {
      throw new Error(`Failed to wipe database: ${response.statusText}`)
    }
  }

  async bulkMoveSnippets(snippetIds: string[], targetNamespaceId: string): Promise<void> {
    if (!this.isValidUrl()) {
      throw new Error('Invalid Flask backend URL')
    }
    const response = await fetch(`${this.baseUrl}/api/snippets/bulk-move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snippetIds, targetNamespaceId })
    })
    if (!response.ok) {
      throw new Error(`Failed to bulk move snippets: ${response.statusText}`)
    }
  }

  async getSnippetsByNamespace(namespaceId: string): Promise<Snippet[]> {
    const snippets = await this.getAllSnippets();
    return snippets.filter(s => s.namespaceId === namespaceId);
  }

  async getNamespace(id: string): Promise<import('./types').Namespace | null> {
    const namespaces = await this.getAllNamespaces();
    return namespaces.find(ns => ns.id === id) || null;
  }

  async clearDatabase(): Promise<void> {
    return this.wipeDatabase();
  }

  async getStats() {
    const snippets = await this.getAllSnippets();
    const namespaces = await this.getAllNamespaces();
    const templates = snippets.filter(s => s.isTemplate);
    return {
      snippetCount: snippets.length,
      templateCount: templates.length,
      namespaceCount: namespaces.length,
      storageType: 'indexeddb' as const,
      databaseSize: 0,
    };
  }

  async exportDatabase(): Promise<{ snippets: Snippet[]; namespaces: import('./types').Namespace[] }> {
    const snippets = await this.getAllSnippets();
    const namespaces = await this.getAllNamespaces();
    return { snippets, namespaces };
  }

  async importDatabase(data: { snippets: Snippet[]; namespaces: import('./types').Namespace[] }): Promise<void> {
    await this.wipeDatabase();
    
    for (const namespace of data.namespaces) {
      await this.createNamespace(namespace);
    }
    
    for (const snippet of data.snippets) {
      await this.createSnippet(snippet);
    }
  }
}
