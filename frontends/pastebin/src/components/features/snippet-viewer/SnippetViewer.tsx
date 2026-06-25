'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogClose,
} from '@metabuilder/components/m3'
import { Snippet } from '@/lib/types'
import styles from './snippet-viewer.module.scss'

interface SnippetViewerProps {
  open: boolean
  snippet: Snippet | null
  onOpenChange: (open: boolean) => void
}

export function SnippetViewer({ open, snippet, onOpenChange }: SnippetViewerProps) {
  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="lg" fullWidth>
      <DialogClose onClick={() => onOpenChange(false)} />
      <DialogTitle>{snippet?.title ?? ''}</DialogTitle>
      <DialogContent className={styles.content}>
        {snippet && (
          <div className={styles.contentInner}>
            <div className={styles.fullPane}>
              <pre>{snippet.code}</pre>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
