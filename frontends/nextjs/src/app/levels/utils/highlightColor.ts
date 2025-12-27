import type { PermissionLevel } from '../levels-data'

export const highlightColor = (level: PermissionLevel) => {
  if (level.id === 6) return 'warning.main'
  if (level.id === 5) return 'primary.main'
  return 'divider'
}
