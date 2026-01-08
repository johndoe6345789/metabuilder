let initialized = false

export function isInitialized(): boolean {
  return initialized
}

export function setInitialized(value: boolean): void {
  initialized = value
}
