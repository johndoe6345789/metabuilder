'use client'

/**
 * A block's id should never be its own data-entry chore: an author already
 * says what a block is for -- its text, or how it's announced to assistive
 * tech -- and that is also exactly what an id is for. This derives one from
 * that, once, at creation, the same way a Notion or Confluence heading gets
 * a stable permalink without anyone typing a slug.
 *
 * Deliberately NOT re-derived on every later text edit: a stable id means
 * an existing anchor or aria-reference to this block never silently breaks
 * because its wording changed. An id typed here by an author is exactly as
 * "final" as one this module generated -- neither is ever overwritten.
 */
import { paletteItem, type TreeNode } from './builder-registry'
import { propSchema } from '@/components/blocks/block-props'
import { inferred } from './auto-props-infer'

const MAX_SLUG_LENGTH = 40

/** list-item's first text-typed field is its icon (a Material Symbol name,
 *  not text to a reader), so its real text -- title -- has to be named
 *  explicitly rather than found by "first text field" like every other
 *  block. */
const PRIMARY_TEXT_FIELD: Record<string, string> = {
  'list-item': 'title',
}

function primaryTextFieldName(type: string): string | undefined {
  if (type in PRIMARY_TEXT_FIELD) return PRIMARY_TEXT_FIELD[type]
  const fields = propSchema(type) ?? inferred(paletteItem(type)?.defaults ?? {})
  return fields.find(f => f.type === 'text')?.name
}

const nonBlank = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value : undefined

/**
 * What a block is "called," for id generation: its own displayed text if
 * it has any, else how it's announced to assistive tech, else its Name
 * field, else just its block name -- always something, never blank.
 */
export function identitySource(
  type: string,
  props: Record<string, unknown>
): string {
  const textField = primaryTextFieldName(type)
  return (
    (textField === undefined ? undefined : nonBlank(props[textField])) ??
    nonBlank(props.ariaLabel) ??
    nonBlank(props.name) ??
    paletteItem(type)?.name ??
    type
  )
}

/** Lowercase, hyphenated, id-safe. Collapses runs of anything that is not
 *  a letter or digit into one hyphen and trims them from each end, so
 *  punctuation-heavy text ("Trade prints — and enjoy it!") doesn't leave
 *  stray or doubled hyphens. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, '')
}

function idsInUse(node: TreeNode, skipId: string): Set<string> {
  const ids = new Set<string>()
  const walk = (n: TreeNode): void => {
    if (n.id !== skipId && typeof n.props.id === 'string' && n.props.id !== '') {
      ids.add(n.props.id)
    }
    n.children.forEach(walk)
  }
  walk(node)
  return ids
}

/** The first id-safe slug not already used elsewhere in the tree --
 *  "hero", then "hero-2", "hero-3", and so on. */
export function uniqueSlug(
  base: string,
  tree: TreeNode,
  skipId: string
): string {
  if (base === '') return ''
  const taken = idsInUse(tree, skipId)
  if (!taken.has(base)) return base
  let n = 2
  while (taken.has(`${base}-${n}`)) n += 1
  return `${base}-${n}`
}

/** The id a brand-new node should start with. */
export function autoId(
  type: string,
  props: Record<string, unknown>,
  tree: TreeNode,
  skipId: string
): string {
  return uniqueSlug(slugify(identitySource(type, props)), tree, skipId)
}
