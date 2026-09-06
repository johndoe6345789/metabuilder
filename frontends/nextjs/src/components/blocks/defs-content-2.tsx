'use client'
/** Content blocks. See block-defs for how these are assembled. */

import type { BlockDef } from './block-types'
import {
  Badge,
  Chip,
  Typography,
} from '@/m3'
import {
  propNumber,
  propText,
} from './block-coerce'
import {
  m,
} from './defs-shared'

export const CONTENT_DEFS_2: BlockDef[] = [
  {
    meta: m('stat', 'Stat', 'monitoring', 'Content', false, {}),
    render: p => (
      <div>
        <Typography variant="h4">{propText(p.value, '0')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {propText(p.label, 'Members')}
        </Typography>
      </div>
    ),
  },
  {
    // No icon default, and no fallback for either optional part below: a
    // fallback meant to show the block exists while editing is published
    // as real content. A price list written as three plain list items came
    // out with a bell against every line and the word "Description" under
    // it. The title keeps its placeholder -- an empty item still has to be
    // visible and selectable in the builder.
    meta: m('list-item', 'List Item', 'list', 'Content', false, {}),
    render: p => {
      const icon = propText(p.icon)
      const description = propText(p.description)
      return (
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {icon !== '' && (
            <span className="material-symbols-rounded" aria-hidden="true">
              {icon}
            </span>
          )}
          <div>
            <Typography variant="body1">
              {propText(p.title, 'Title')}
            </Typography>
            {description !== '' && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </div>
        </div>
      )
    },
  },
  {
    meta: m('m3.chip', 'Chip', 'label', 'Content', false, {}),
    render: p => <Chip label={propText(p.label, 'Chip')} size="small" />,
  },
  {
    meta: m('m3.badge', 'Badge', 'notifications', 'Content', true, {
      count: 1,
    }),
    render: (p, kids) => <Badge content={propNumber(p.count, 1)}>{kids}</Badge>,
  },
]
