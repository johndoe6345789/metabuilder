'use client'

/**
 * What "the fields for a block type" are, and which one of them is
 * primary -- shared by id-generation (auto-identity.ts) and the Properties
 * tab (ComponentTreePrimaryField / ComponentTreeAutoProps), so the two can
 * never disagree about which field a block is "about."
 */
import { WORKFLOW_SOURCE } from './workflow-source'
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

/**
 * Every block can run a workflow when it is clicked, so this is appended
 * to whatever a block declares rather than repeated in thirty-seven
 * schemas. A heading, an image or a card is as clickable as a button --
 * the block that happens to look like a control should not be the only
 * one that can do something.
 *
 * `source` names the tenant's published workflows, supplied live by
 * ComponentTreeAutoProps, so the name is picked rather than typed: a name
 * that matches nothing runs nothing, and quietly.
 */
const CLICK_FIELD: PropField = {
  name: 'onClickWorkflow',
  label: 'When clicked, run',
  type: 'text',
  source: WORKFLOW_SOURCE,
  placeholder: 'Nothing',
  hint:
    'A workflow of yours. It has to be published and set to run when ' +
    'someone submits a form, which is what lets a page ask for it',
}

export function fieldsFor(type: string): PropField[] {
  const own = propSchema(type) ?? inferred(paletteItem(type)?.defaults ?? {})
  // A block that already declares one keeps its own wording.
  if (own.some(f => f.name === CLICK_FIELD.name)) return own
  return [...own, CLICK_FIELD]
}

export function primaryFieldName(type: string): string | undefined {
  if (type in PRIMARY_TEXT_FIELD) return PRIMARY_TEXT_FIELD[type]
  // The click field is text-typed and on every block, so without this it
  // would become the primary field of every block that declares no text
  // of its own -- a Grid's identity would be derived from the name of a
  // workflow, and the Properties tab would lead with it.
  return fieldsFor(type).find(
    f => f.type === 'text' && f.name !== CLICK_FIELD.name
  )?.name
}

export function primaryField(type: string): PropField | undefined {
  const name = primaryFieldName(type)
  return name === undefined
    ? undefined
    : fieldsFor(type).find(f => f.name === name)
}
