'use client'
/** Feedback blocks. See block-defs for how these are assembled. */

import type { BlockDef } from './block-types'
import {
  Alert,
  LinearProgress,
  Skeleton,
  Tooltip,
} from '@/m3'
import {
  propNumber,
  propText,
} from './block-coerce'
import {
  m,
} from './defs-shared'

export const FEEDBACK_DEFS: BlockDef[] = [
  {
    meta: m('m3.alert', 'Alert', 'info', 'Feedback', false, {
      severity: 'info',
    }),
    render: p => (
      <Alert severity={propText(p.severity, 'info') as 'info'}>
        {propText(p.text, 'Something worth knowing.')}
      </Alert>
    ),
  },
  {
    meta: m('m3.progress', 'Progress bar', 'linear_scale', 'Feedback', false, {
      value: 40,
    }),
    render: p => (
      <LinearProgress variant="determinate" value={propNumber(p.value, 40)} />
    ),
  },
  {
    meta: m('m3.skeleton', 'Skeleton', 'view_stream', 'Feedback', false, {
      height: 24,
    }),
    render: p => (
      <Skeleton variant="rectangular" height={propNumber(p.height, 24)} />
    ),
  },
  {
    meta: m('m3.tooltip', 'Tooltip', 'help', 'Feedback', true, {
    }),
    render: (p, kids) => (
      <Tooltip title={propText(p.title, 'Explanation')}>
        <span>{kids}</span>
      </Tooltip>
    ),
  },
]
