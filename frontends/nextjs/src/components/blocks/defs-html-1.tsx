'use client'
/**
 * HTML blocks, split across files to keep each one small. See defs-html-2
 * for headings, lists, and links.
 *
 * Names shown in the builder are what a block does ("Box"), not the raw
 * tag it renders as ("Div") -- the tag is an implementation detail an
 * author should never need to already know to use this. `type` (the
 * palette key, e.g. 'html.div') is unaffected; only the label a person
 * sees changes.
 */

import type { BlockDef } from './block-types'
import { propNumber, propText } from './block-coerce'
import { m } from './defs-shared'

export const HTML_DEFS_1: BlockDef[] = [
  {
    meta: m('html.div', 'Box', 'check_box_outline_blank', 'HTML', true, {
      padding: 0,
    }),
    render: (p, kids) => (
      <div style={{ padding: propNumber(p.padding, 0) }}>{kids}</div>
    ),
  },
  {
    meta: m('html.section', 'Section', 'article', 'HTML', true, {}),
    render: (_p, kids) => <section>{kids}</section>,
  },
  {
    meta: m('html.span', 'Inline text', 'text_fields', 'HTML', false, {}),
    render: p => <span>{propText(p.text, 'span')}</span>,
  },
  {
    meta: m('html.p', 'Paragraph', 'notes', 'HTML', false, {}),
    render: p => <p>{propText(p.text, 'Paragraph text.')}</p>,
  },
]
