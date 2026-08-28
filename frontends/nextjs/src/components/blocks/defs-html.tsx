'use client'
/** HTML blocks. See block-defs for how these are assembled. */

import type { BlockDef } from './block-types'
import {
  propNumber,
  propText,
} from './block-coerce'
import {
  m,
} from './defs-shared'

export const HTML_DEFS: BlockDef[] = [
  {
    meta: m('html.div', 'Div', 'check_box_outline_blank', 'HTML', true, {
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
    meta: m('html.span', 'Span', 'text_fields', 'HTML', false, {
      text: 'span',
    }),
    render: p => <span>{propText(p.text, 'span')}</span>,
  },
  {
    meta: m('html.p', 'Paragraph', 'notes', 'HTML', false, {
      text: 'Paragraph text.',
    }),
    render: p => <p>{propText(p.text, 'Paragraph text.')}</p>,
  },
  {
    meta: m('html.h1', 'H1', 'format_h1', 'HTML', false, { text: 'Heading 1' }),
    render: p => <h1>{propText(p.text, 'Heading 1')}</h1>,
  },
  {
    meta: m('html.h2', 'H2', 'format_h2', 'HTML', false, { text: 'Heading 2' }),
    render: p => <h2>{propText(p.text, 'Heading 2')}</h2>,
  },
  {
    meta: m('html.h3', 'H3', 'format_h3', 'HTML', false, { text: 'Heading 3' }),
    render: p => <h3>{propText(p.text, 'Heading 3')}</h3>,
  },
  {
    meta: m('html.ul', 'List (ul)', 'format_list_bulleted', 'HTML', true, {}),
    render: (_p, kids) => <ul>{kids}</ul>,
  },
  {
    meta: m('html.li', 'List item (li)', 'chevron_right', 'HTML', true, {
      text: 'Item',
    }),
    render: (p, kids) => (
      <li>
        {propText(p.text, 'Item')}
        {kids}
      </li>
    ),
  },
  {
    meta: m('html.a', 'Link', 'link', 'HTML', false, {
      text: 'Link',
      href: '#',
    }),
    render: p => <a href={propText(p.href, '#')}>{propText(p.text, 'Link')}</a>,
  },
]
