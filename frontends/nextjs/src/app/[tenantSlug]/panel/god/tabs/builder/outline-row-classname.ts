import type { DropWhere } from './component-tree-drop'

/** The row's variant classes: selected state plus which edge (or "into")
 *  a drag is currently hovering over, if any. */
export function outlineRowClassName(
  styles: Record<string, string>,
  selected: boolean,
  dropping: DropWhere | null
): string {
  return [
    styles.row,
    selected ? styles.rowActive : '',
    dropping === 'into' ? styles.rowDropping : '',
    dropping === 'before' ? styles.rowDropBefore : '',
    dropping === 'after' ? styles.rowDropAfter : '',
  ]
    .filter(Boolean)
    .join(' ')
}
