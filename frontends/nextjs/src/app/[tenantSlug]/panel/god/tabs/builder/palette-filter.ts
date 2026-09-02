import type { PaletteItem } from './builder-registry'

/** Palette items whose name matches `query`, case-insensitively. An empty
 *  query matches nothing -- callers show the grouped-by-category view in
 *  that case instead of a flat 37-item list. */
export function filterPalette(
  items: readonly PaletteItem[],
  query: string
): PaletteItem[] {
  const trimmed = query.trim().toLowerCase()
  if (trimmed === '') return []
  return items.filter(i => i.name.toLowerCase().includes(trimmed))
}
