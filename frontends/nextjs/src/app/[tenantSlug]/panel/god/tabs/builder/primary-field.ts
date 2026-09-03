'use client'

/**
 * What "the fields for a block type" are, and which one of them is
 * primary -- shared by id-generation (auto-identity.ts) and the Properties
 * tab (ComponentTreePrimaryField / ComponentTreeAutoProps), so the two can
 * never disagree about which field a block is "about."
 */
import { paletteItem } from './builder-registry'
import { propSchema, type PropField } from '@/components/blocks/block-props'
import { inferred } from './auto-props-infer'

/** list-item's first text-typed field is its icon (a Material Symbol name,
 *  not text to a reader), so its real text -- title -- has to be named
 *  explicitly rather than found by "first text field" like every other
 *  block. */
const PRIMARY_TEXT_FIELD: Record<string, string> = {
  'list-item': 'title',
}

export function fieldsFor(type: string): PropField[] {
  return propSchema(type) ?? inferred(paletteItem(type)?.defaults ?? {})
}

export function primaryFieldName(type: string): string | undefined {
  if (type in PRIMARY_TEXT_FIELD) return PRIMARY_TEXT_FIELD[type]
  return fieldsFor(type).find(f => f.type === 'text')?.name
}

export function primaryField(type: string): PropField | undefined {
  const name = primaryFieldName(type)
  return name === undefined
    ? undefined
    : fieldsFor(type).find(f => f.name === name)
}
