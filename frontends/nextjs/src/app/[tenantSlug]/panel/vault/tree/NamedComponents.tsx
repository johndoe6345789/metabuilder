'use client'

import type { ReactNode } from 'react'
import { Alert, Paper, Typography } from '@/m3'
import type { Context } from '../vault-context'
import { vaultView } from '../vault-view'
import s from '../page.module.scss'

/**
 * The layout components this tree can name that are neither a raw HTML
 * element nor an M3 primitive -- each has vault-specific behaviour (Notice
 * reads the controller's own notice state) rather than being a config-
 * driven passthrough.
 */
// Partial, not Record: node.component names an arbitrary string, and most
// of them aren't a key here -- see primitives.ts for why this matters.
export const NAMED_COMPONENTS: Partial<
  Record<string, (children: ReactNode, context: Context) => ReactNode>
> = {
  Page: children => <div className={s.page}>{children}</div>,
  Loading: () => <Typography variant="body2">{vaultView.loadingLabel}</Typography>,
  Notice: (_children, { vault }) =>
    vault.notice === null ? null : (
      <Alert severity={vault.notice.kind} className={s.alert}>
        {vault.notice.message}
      </Alert>
    ),
  SplitLayout: children => <div className={s.splitLayout}>{children}</div>,
  ListPanel: children => <Paper className={s.listPanel}>{children}</Paper>,
  EditorPanel: children => <Paper className={s.editorPanel}>{children}</Paper>,
}
