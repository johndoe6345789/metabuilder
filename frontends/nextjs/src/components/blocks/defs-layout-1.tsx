'use client'
/** Layout blocks. See block-defs for how these are assembled. */

import type { BlockDef } from './block-types'
import {
  Card,
} from '@/m3'
import {
  isRecord,
  propDirection,
  propGap,
  propNumber,
} from './block-coerce'
import {
  m,
} from './defs-shared'

export const LAYOUT_DEFS_1: BlockDef[] = [
  {
    meta: m('container', 'Container', 'grid_view', 'Layout', true, {
      direction: 'column',
      gap: 12,
    }),
    render: (p, kids) => {
      const style = isRecord(p.style) ? p.style : {}
      return (
        <div
          style={{
            ...style,
            display: 'flex',
            flexDirection: propDirection(p.direction),
            gap: propGap(p.gap),
          }}
        >
          {kids}
        </div>
      )
    },
  },
  {
    meta: m('card', 'Card', 'crop_square', 'Layout', true),
    render: (_p, kids) => <Card style={{ padding: 16 }}>{kids}</Card>,
  },
  {
    meta: m('grid', 'Grid', 'grid_on', 'Layout', true, { columns: 3, gap: 16 }),
    render: (p, kids) => (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${propNumber(p.columns, 3)}, 1fr)`,
          gap: propGap(p.gap),
        }}
      >
        {kids}
      </div>
    ),
  },
]
