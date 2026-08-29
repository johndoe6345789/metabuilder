'use client'
/** Content blocks. See block-defs for how these are assembled. */

import type { BlockDef } from './block-types'
import {
  Avatar,
  Typography,
} from '@/m3'
import {
  propNumber,
  propText,
} from './block-coerce'
import {
  m,
} from './defs-shared'

export const CONTENT_DEFS_1: BlockDef[] = [
  {
    meta: m('heading', 'Heading', 'title', 'Content', false, {
      text: 'Heading',
    }),
    render: p => (
      <Typography variant="h5">{propText(p.text, 'Heading')}</Typography>
    ),
  },
  {
    meta: m('text', 'Text', 'notes', 'Content', false, { text: 'Some text' }),
    render: p => <Typography variant="body1">{propText(p.text)}</Typography>,
  },
  {
    meta: m('image', 'Image', 'image', 'Content', false, {
      src: '',
      alt: '',
      radius: 0,
    }),
    render: p => {
      const src = propText(p.src)
      if (src.length === 0) return <em>Image: no src set</em>
      return (
        <img
          src={src}
          alt={propText(p.alt)}
          style={{
            maxWidth: '100%',
            borderRadius: propNumber(p.radius, 0),
          }}
        />
      )
    },
  },
  {
    meta: m('avatar', 'Avatar', 'account_circle', 'Content', false, {
      initials: 'U',
      size: 'md',
    }),
    render: p => {
      const size = propText(p.size, 'md')
      const src = propText(p.src)
      return (
        <Avatar
          src={src.length > 0 ? src : undefined}
          sm={size === 'sm'}
          md={size === 'md'}
          lg={size === 'lg'}
          xl={size === 'xl'}
        >
          {propText(p.initials, 'U')}
        </Avatar>
      )
    },
  },
]
