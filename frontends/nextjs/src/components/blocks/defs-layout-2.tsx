'use client'
/** Layout blocks. See block-defs for how these are assembled. */

import type { BlockDef } from './block-types'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Paper,
} from '@/m3'
import {
  propNumber,
  propText,
} from './block-coerce'
import {
  m,
} from './defs-shared'

export const LAYOUT_DEFS_2: BlockDef[] = [
  {
    meta: m('divider', 'Divider', 'horizontal_rule', 'Layout', false, {
      margin: 16,
    }),
    render: p => (
      <hr
        style={{
          border: 'none',
          borderTop: '1px solid var(--mat-sys-outline-variant, #30363d)',
          margin: `${propNumber(p.margin, 16)}px 0`,
        }}
      />
    ),
  },
  {
    meta: m('m3.paper', 'Paper', 'layers', 'Layout', true, { padding: 16 }),
    render: (p, kids) => (
      <Paper style={{ padding: propNumber(p.padding, 16) }}>{kids}</Paper>
    ),
  },
  {
    meta: m('m3.accordion', 'Accordion', 'expand_more', 'Layout', true, {
      title: 'Details',
    }),
    render: (p, kids) => (
      <Accordion>
        <AccordionSummary>{propText(p.title, 'Details')}</AccordionSummary>
        <AccordionDetails>{kids}</AccordionDetails>
      </Accordion>
    ),
  },
]
