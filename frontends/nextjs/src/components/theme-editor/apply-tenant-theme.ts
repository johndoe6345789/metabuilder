import {
  LIGHT_DEFAULTS,
  DARK_DEFAULTS,
  applyColorsToRoot,
} from './theme-defaults'
import type { ThemeColors } from './theme-defaults'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'
// Single-tenant local deployment for now, same default every other God Panel
// publish flow in this pass uses (ComponentTreeTab, PackagesTab).
const TENANT = 'system'
const STORAGE_KEY = 'pg-theme-overrides'

export interface ResolvedTenantTheme {
  light: ThemeColors
  dark: ThemeColors
}

function fromLocalStorage(): ResolvedTenantTheme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored == null) return null
    const parsed = JSON.parse(stored) as {
      light?: ThemeColors
      dark?: ThemeColors
    }
    return {
      light: { ...LIGHT_DEFAULTS, ...(parsed.light ?? {}) },
      dark: { ...DARK_DEFAULTS, ...(parsed.dark ?? {}) },
    }
  } catch {
    return null
  }
}

/**
 * DBAL (shared, tenant-wide) first, falling back to localStorage (per-
 * browser) if DBAL has nothing yet or is unreachable -- same fail-safe
 * pattern WorkspacePageSlot uses for component trees. Resolves to the
 * built-in defaults if neither has anything.
 *
 * Shared by useThemeEditor (which additionally needs the raw light/dark
 * values to populate the editor UI) and Providers (which just applies
 * them app-wide on every page load, not only while the God Panel's Theme
 * tab happens to be mounted).
 */
export async function resolveTenantTheme(): Promise<ResolvedTenantTheme> {
  try {
    const res = await fetch(`${DBAL}/${TENANT}/core/TenantTheme/${TENANT}`, {
      signal: AbortSignal.timeout(6000),
    })
    if (res.ok) {
      const json = (await res.json()) as { data?: Record<string, unknown> }
      const row = json.data
      const rawLight = row?.lightColors
      const rawDark = row?.darkColors
      if (typeof rawLight === 'string' && typeof rawDark === 'string') {
        return {
          light: {
            ...LIGHT_DEFAULTS,
            ...(JSON.parse(rawLight) as ThemeColors),
          },
          dark: { ...DARK_DEFAULTS, ...(JSON.parse(rawDark) as ThemeColors) },
        }
      }
    }
  } catch {
    // fall through to localStorage
  }
  return fromLocalStorage() ?? { light: LIGHT_DEFAULTS, dark: DARK_DEFAULTS }
}

/** Applies the given mode's half of a resolved theme to :root. */
export function applyTenantTheme(
  theme: ResolvedTenantTheme,
  mode: 'light' | 'dark'
): void {
  applyColorsToRoot(mode === 'dark' ? theme.dark : theme.light)
}
