import { describe, expect, it } from 'vitest'
import jsonComponentsRegistry from '../../../../json-components-registry.json'
import { getUIComponent } from '../component-registry'

type JsonRegistryEntry = {
  type?: string
  name?: string
  status?: string
  source?: string
}

type JsonComponentRegistry = {
  components?: JsonRegistryEntry[]
}

const registry = jsonComponentsRegistry as JsonComponentRegistry
const registryEntries = registry.components ?? []

const allowlistedMissingComponents = new Map<string, string>([])

const getTellTaleEntryKey = (entry: JsonRegistryEntry): string | undefined =>
  entry.type ?? entry.name

describe('json component registry coverage', () => {
  it('resolves every registry entry to a UI component or allowlisted exception', () => {
    for (const entry of registryEntries) {
      const type = getTellTaleEntryKey(entry)
      if (!type) {
        throw new Error(
          `Registry entry missing type/name. Status: ${entry.status ?? 'unknown'} Source: ${
            entry.source ?? 'unknown'
          }`
        )
      }

      const component = getUIComponent(type)
      if (!component) {
        const allowlistedReason = allowlistedMissingComponents.get(type)
        if (allowlistedReason) {
          expect(
            component,
            `Allowlisted missing component should stay null: ${type}. Reason: ${allowlistedReason}`
          ).toBeNull()
          continue
        }
        throw new Error(`Missing UI component for registry type "${type}".`)
      }

      expect(component, `Registry type "${type}" should resolve to a component.`).toBeTruthy()
    }
  })
})
