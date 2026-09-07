'use client'

/** Palette metadata shared by the block tables. */

import type { BlockCategory, PaletteItem } from './block-types'

export const m = (
  type: string,
  name: string,
  icon: string,
  category: BlockCategory,
  container: boolean,
  defaults: Record<string, unknown> = {}
): PaletteItem => ({ type, name, icon, category, container, defaults })
