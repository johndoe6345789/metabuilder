'use client'
/** Misc blocks. See block-defs for how these are assembled. */

import type { BlockDef } from './block-types'
import {
  CircularProgress,
} from '@/m3'
import {
  propText,
} from './block-coerce'
import { m } from './defs-shared'
import {
  PackageManagerBlock,
  SchemaEditorBlock,
  Webchat,
  WorkflowEditorBlock,
} from './defs-lazy'

export const MISC_DEFS: BlockDef[] = [
  {
    meta: m(
      'mb.WorkflowEditor',
      'Workflow Editor',
      'account_tree',
      'MetaBuilder',
      false
    ),
    render: () => <WorkflowEditorBlock />,
  },
  {
    meta: m(
      'mb.PackageManager',
      'Package Manager',
      'deployed_code',
      'MetaBuilder',
      false
    ),
    render: () => <PackageManagerBlock />,
  },
  // ---- HTML primitives -------------------------------------------------
  // The tree is meant to build whole pages, which needs the plain elements
  // as well as the styled ones.

  // ---- More of the existing component library --------------------------
  {
    meta: m(
      'm3.spinner',
      'Spinner',
      'progress_activity',
      'Feedback',
      false,
      {}
    ),
    render: () => <CircularProgress />,
  },
  {
    meta: m('pkg.webchat', 'Webchat', 'chat', 'Community', false, {
      channel: '#general',
    }),
    render: p => <Webchat channel={propText(p.channel, '#general')} />,
  },
  {
    meta: m('mb.SchemaEditor', 'Schema Editor', 'schema', 'MetaBuilder', false),
    render: () => <SchemaEditorBlock />,
  },
]
