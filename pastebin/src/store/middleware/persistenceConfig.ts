export interface PersistenceConfig {
  enabled: boolean
  debounceMs: number
  logging: boolean
  actions: string[]
  retryOnFailure: boolean
  maxRetries: number
  retryDelayMs: number
}

export const defaultPersistenceConfig: PersistenceConfig = {
  enabled: true,
  debounceMs: 100,
  logging: true,
  actions: [
    'snippets/create/fulfilled',
    'snippets/update/fulfilled',
    'snippets/delete/fulfilled',
    'snippets/bulkMove/fulfilled',
    'namespaces/create/fulfilled',
    'namespaces/delete/fulfilled',
  ],
  retryOnFailure: true,
  maxRetries: 3,
  retryDelayMs: 1000,
}

let currentConfig: PersistenceConfig = { ...defaultPersistenceConfig }

export function getPersistenceConfig(): PersistenceConfig {
  return currentConfig
}

export function updatePersistenceConfig(partial: Partial<PersistenceConfig>): void {
  currentConfig = {
    ...currentConfig,
    ...partial,
  }
}

export function resetPersistenceConfig(): void {
  currentConfig = { ...defaultPersistenceConfig }
}

export function addPersistenceAction(action: string): void {
  if (!currentConfig.actions.includes(action)) {
    currentConfig.actions.push(action)
  }
}

export function removePersistenceAction(action: string): void {
  currentConfig.actions = currentConfig.actions.filter(a => a !== action)
}

export function enablePersistence(): void {
  currentConfig.enabled = true
}

export function disablePersistence(): void {
  currentConfig.enabled = false
}

export function enableLogging(): void {
  currentConfig.logging = true
}

export function disableLogging(): void {
  currentConfig.logging = false
}

export function setDebounceDelay(ms: number): void {
  if (ms >= 0) {
    currentConfig.debounceMs = ms
  }
}
