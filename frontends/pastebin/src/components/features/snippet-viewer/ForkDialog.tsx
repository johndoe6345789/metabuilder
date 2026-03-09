'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@metabuilder/components/fakemui'
import { MaterialIcon } from '@metabuilder/components/fakemui'
import { useAppDispatch } from '@/store/hooks'
import { addSnippetLocal } from '@/store/slices/snippetsSlice'
import { forkSnippet, forkSharedSnippet } from '@/store/slices/revisionsSlice'
import type { Snippet } from '@/lib/types'
import styles from './fork-dialog.module.scss'

interface ForkDialogProps {
  open: boolean
  onClose: () => void
  snippet: Pick<Snippet, 'id' | 'title'>
  isShared?: boolean
  token?: string
}

export function ForkDialog({ open, onClose, snippet, isShared, token }: ForkDialogProps) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [title, setTitle] = useState(`${snippet.title} (fork)`)
  const [forking, setForking] = useState(false)

  if (!open) return null

  async function handleFork() {
    setForking(true)
    try {
      const newSnippet = isShared && token
        ? await dispatch(forkSharedSnippet({ token, title })).unwrap()
        : await dispatch(forkSnippet({ snippetId: snippet.id, title })).unwrap()
      dispatch(addSnippetLocal(newSnippet))
      onClose()
      router.push(`/snippet/${newSnippet.id}`)
    } catch {
      toast.error('Failed to fork snippet — please try again')
    }
    setForking(false)
  }

  return (
    <div
      className={styles.overlay}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Fork snippet"
    >
      <div className={styles.dialog}>
        <div className={styles.header}>
          <MaterialIcon name="call_split" size={20} className={styles.headerIcon} aria-hidden="true" />
          <span className={styles.headerTitle}>Fork snippet</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <MaterialIcon name="close" size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.hint}>
            Create a personal copy of this snippet in your account.
          </p>
          <label className={styles.label} htmlFor="fork-title">Title</label>
          <input
            id="fork-title"
            className={styles.input}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && title.trim()) handleFork() }}
            autoFocus
          />
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            className={styles.forkBtn}
            onClick={handleFork}
            disabled={forking || !title.trim()}
          >
            <MaterialIcon name="call_split" size={16} aria-hidden="true" />
            {forking ? 'Forking…' : 'Fork'}
          </button>
        </div>
      </div>
    </div>
  )
}
