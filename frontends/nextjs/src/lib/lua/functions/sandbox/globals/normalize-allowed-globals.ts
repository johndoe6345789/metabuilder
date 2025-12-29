import { DEFAULT_ALLOWED_GLOBALS } from './default-allowed-globals'

const ALLOWED_SET = new Set<string>(DEFAULT_ALLOWED_GLOBALS)

export function normalizeAllowedGlobals(allowedGlobals?: string[]): string[] {
  if (!allowedGlobals || allowedGlobals.length === 0) {
    return [...DEFAULT_ALLOWED_GLOBALS]
  }

  const filtered = allowedGlobals.filter(value => ALLOWED_SET.has(value))
  const unique = Array.from(new Set(filtered))

  return unique.length > 0 ? unique : [...DEFAULT_ALLOWED_GLOBALS]
}
