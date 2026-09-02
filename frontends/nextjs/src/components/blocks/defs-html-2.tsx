'use client'
/**
 * HTML blocks, continued from defs-html-1: headings, lists, and links.
 *
 * Names shown in the builder are what a block does ("Heading 1"), not the
 * raw tag it renders as ("H1") -- the tag is an implementation detail an
 * author should never need to already know to use this. `type` (the
 * palette key, e.g. 'html.h1') is unaffected; only the label a person
 * sees changes.
 */

import type { BlockDef } from './block-types'
import { propText } from './block-coerce'
import { m } from './defs-shared'

export const HTML_DEFS_2: BlockDef[] = [
  {
    meta: m('html.h1', 'Heading 1', 'format_h1', 'HTML', false, {
      text: 'Heading 1',
    }),
    render: p => <h1>{propText(p.text, 'Heading 1')}</h1>,
  },
  {
    meta: m('html.h2', 'Heading 2', 'format_h2', 'HTML', false, {
      text: 'Heading 2',
    }),
    render: p => <h2>{propText(p.text, 'Heading 2')}</h2>,
  },
  {
    meta: m('html.h3', 'Heading 3', 'format_h3', 'HTML', false, {
      text: 'Heading 3',
    }),
    render: p => <h3>{propText(p.text, 'Heading 3')}</h3>,
  },
  {
    meta: m(
      'html.ul',
      'Bulleted list',
      'format_list_bulleted',
      'HTML',
      true,
      {}
    ),
    render: (_p, kids) => <ul>{kids}</ul>,
  },
  {
    meta: m('html.li', 'List item', 'chevron_right', 'HTML', true, {
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
