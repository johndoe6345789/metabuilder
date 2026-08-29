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
    meta: m('stat', 'Stat', 'monitoring', 'Content', false, {
      label: 'Members',
      value: '0',
    }),
    render: p => (
      <div>
        <Typography variant="h4">{propText(p.value, '0')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {propText(p.label, 'Label')}
        </Typography>
      </div>
    ),
  },
  {
    meta: m('list-item', 'List Item', 'list', 'Content', false, {
      icon: 'notifications',
      title: 'Title',
      description: 'Description',
    }),
    render: p => (
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span className="material-symbols-rounded" aria-hidden="true">
          {propText(p.icon, 'notifications')}
        </span>
        <div>
          <Typography variant="body1">{propText(p.title, 'Title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {propText(p.description)}
          </Typography>
        </div>
      </div>
    ),
  },
  {
    meta: m('m3.chip', 'Chip', 'label', 'Content', false, { label: 'Chip' }),
    render: p => <Chip label={propText(p.label, 'Chip')} size="small" />,
  },
  {
    meta: m('m3.badge', 'Badge', 'notifications', 'Content', true, {
      count: 1,
    }),
    render: (p, kids) => <Badge content={propNumber(p.count, 1)}>{kids}</Badge>,
  },
]
