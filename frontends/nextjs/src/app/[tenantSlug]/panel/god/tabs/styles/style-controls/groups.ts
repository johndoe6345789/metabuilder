import type { StyleGroup } from './types'
import { TEXT_GROUP } from './text-group'
import { BACKGROUND_GROUP, SPACING_GROUP } from './background-spacing-groups'
import { BORDER_GROUP } from './border-group'
import { EFFECTS_GROUP } from './effects-group'

export const STYLE_GROUPS: StyleGroup[] = [
  TEXT_GROUP,
  BACKGROUND_GROUP,
  SPACING_GROUP,
  BORDER_GROUP,
  EFFECTS_GROUP,
]

/** Every property the visual controls manage, for the Advanced list to skip. */
export const MANAGED_PROPS = new Set(
  STYLE_GROUPS.flatMap(g => g.controls.map(c => c.prop))
)
