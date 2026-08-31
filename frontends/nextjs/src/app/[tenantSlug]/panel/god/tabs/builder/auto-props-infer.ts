import type { PropField } from '@/components/blocks/block-props'

/** "runWorkflow" -> "Run workflow", "src" -> "Src". */
function humanise(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/** Fields inferred from defaults, for a block with no schema of its own. */
export function inferred(defaults: Record<string, unknown>): PropField[] {
  return Object.entries(defaults).map(([name, value]) => ({
    name,
    label: humanise(name),
    type:
      typeof value === 'boolean'
        ? 'boolean'
        : typeof value === 'number'
          ? 'number'
          : 'text',
  }))
}
