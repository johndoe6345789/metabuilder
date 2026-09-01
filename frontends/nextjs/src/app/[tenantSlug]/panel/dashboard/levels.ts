/** The five permission tiers, and the colours that stand for them. */

export const LEVEL_COLORS = {
  1: { from: '#3b82f6', to: '#2563eb' },
  2: { from: '#22c55e', to: '#16a34a' },
  3: { from: '#f97316', to: '#ea580c' },
  4: { from: '#a855f7', to: '#9333ea' },
  5: { from: '#f59e0b', to: '#d97706' },
} as const

export const LEVELS = [
  { level: 1, name: 'Public Website', desc: 'Landing pages, public content' },
  { level: 2, name: 'User Area', desc: 'Profiles, comments, chat' },
  { level: 3, name: 'Admin Panel', desc: 'CRUD, user management' },
  { level: 4, name: 'God Builder', desc: 'Schemas and JSON workflows' },
  { level: 5, name: 'Super God', desc: 'Multi-tenant control' },
] as const

type LevelKey = keyof typeof LEVEL_COLORS

/** The colour pair for a level, or a neutral fallback for an unknown one. */
export function levelColors(level: number): { from: string; to: string } {
  // `level` is an arbitrary number from the caller, not narrowed to
  // LevelKey -- the `as` cast doesn't make the lookup exhaustive, so this
  // fallback is real defense against a level outside 1-5.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return LEVEL_COLORS[level as LevelKey] ?? { from: '#9c27b0', to: '#9c27b0' }
}

export function levelGradient(level: number): string {
  const { from, to } = levelColors(level)
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`
}
