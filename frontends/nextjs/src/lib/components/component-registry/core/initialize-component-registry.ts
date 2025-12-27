import { getComponentRegistry } from '../getters/get-component-registry'

export async function initializeComponentRegistry(): Promise<void> {
  getComponentRegistry()
}
