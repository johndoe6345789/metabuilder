/** How a role is coloured in the users table. */

export type ChipColor = 'secondary' | 'primary' | 'default'

const ROLE_COLORS: Record<string, ChipColor> = {
  god: 'secondary',
  supergod: 'secondary',
  admin: 'primary',
}

export function roleColor(role: string): ChipColor {
  return ROLE_COLORS[role] ?? 'default'
}
