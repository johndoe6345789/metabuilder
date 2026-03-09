'use client'

import { useState } from 'react'
import { MaterialIcon } from '@metabuilder/components/fakemui'
import { useAppDispatch } from '@/store/hooks'
import { patchSnippetLocal } from '@/store/slices/snippetsSlice'
import { generateShareToken, revokeShareToken } from '@/store/slices/shareSlice'
import type { Snippet } from '@/lib/types'
import styles from './share-dialog.module.scss'

interface ShareDialogProps {
  open: boolean
  onClose: () => void
  snippet: Snippet
}

function buildShareUrl(token: string): string {
  if (typeof window === 'undefined') return `/share/${token}`
  return `${window.location.origin}/share/${token}`
}

export function ShareDialog({ open, onClose, snippet }: ShareDialogProps) {
  const dispatch = useAppDispatch()
  const [generating, setGenerating] = useState(false)
  const [revoking, setRevoking] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!open) return null

  const shareUrl = snippet.shareToken ? buildShareUrl(snippet.shareToken) : null
  const encodedTitle = encodeURIComponent(`Check out: ${snippet.title}`)
  const encodedUrl = shareUrl ? encodeURIComponent(shareUrl) : ''
  const gmailUrl = `https://mail.google.com/mail/?view=cm&su=${encodedTitle}&body=${encodedUrl}`
  const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?subject=${encodedTitle}&body=${encodedUrl}`
  const mailtoUrl = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`

  async function handleGenerate() {
    setGenerating(true)
    try {
      const result = await dispatch(generateShareToken(snippet.id)).unwrap()
      dispatch(patchSnippetLocal({ id: snippet.id, fields: { shareToken: result.token } }))
    } catch { /* error handled by slice */ }
    setGenerating(false)
  }

  async function handleRevoke() {
    setRevoking(true)
    try {
      await dispatch(revokeShareToken(snippet.id)).unwrap()
      dispatch(patchSnippetLocal({ id: snippet.id, fields: { shareToken: undefined } }))
    } catch { /* error handled by slice */ }
    setRevoking(false)
  }

  async function handleCopy() {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleNativeShare() {
    if (!shareUrl) return
    navigator.share({ title: snippet.title, url: shareUrl })
  }

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }} role="dialog" aria-modal="true" aria-label="Share snippet">
      <div className={styles.dialog}>
        {/* Header */}
        <div className={styles.header}>
          <MaterialIcon name="share" size={20} className={styles.headerIcon} aria-hidden="true" />
          <span className={styles.headerTitle}>Share snippet</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <MaterialIcon name="close" size={20} />
          </button>
        </div>

        {!shareUrl ? (
          /* Private state */
          <div className={styles.privateState}>
            <div className={styles.privateBadge}>
              <MaterialIcon name="lock" size={32} className={styles.lockIcon} aria-hidden="true" />
              <p className={styles.privateText}>This snippet is private</p>
              <p className={styles.privateHint}>Generate a secret link to share it with anyone — without exposing your snippet ID.</p>
            </div>
            <button
              className={styles.generateBtn}
              onClick={handleGenerate}
              disabled={generating}
            >
              <MaterialIcon name="link" size={16} aria-hidden="true" />
              {generating ? 'Generating…' : 'Generate Share Link'}
            </button>
          </div>
        ) : (
          /* Active share state */
          <>
            {/* URL row */}
            <div className={styles.urlSection}>
              <p className={styles.urlLabel}>Share link</p>
              <div className={styles.urlRow}>
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className={styles.urlInput}
                  onClick={e => (e.target as HTMLInputElement).select()}
                  aria-label="Share URL"
                />
                <button
                  className={`${styles.copyInlineBtn} ${copied ? styles.copyInlineBtnDone : ''}`}
                  onClick={handleCopy}
                  aria-label="Copy link"
                >
                  <MaterialIcon name={copied ? 'check' : 'content_copy'} size={16} />
                </button>
              </div>
            </div>

            {/* Row 1 — Send via email app */}
            <div className={styles.sectionLabel}>Send via</div>
            <div className={styles.appRow}>
              <a href={gmailUrl} target="_blank" rel="noopener noreferrer" className={styles.appCard} aria-label="Share via Gmail">
                <MaterialIcon name="mail" size={24} className={styles.appIcon} aria-hidden="true" />
                <span className={styles.appLabel}>Gmail</span>
              </a>
              <a href={outlookUrl} target="_blank" rel="noopener noreferrer" className={styles.appCard} aria-label="Share via Outlook">
                <MaterialIcon name="mail_outline" size={24} className={styles.appIcon} aria-hidden="true" />
                <span className={styles.appLabel}>Outlook</span>
              </a>
              <a href={mailtoUrl} className={styles.appCard} aria-label="Share via email">
                <MaterialIcon name="email" size={24} className={styles.appIcon} aria-hidden="true" />
                <span className={styles.appLabel}>Email</span>
              </a>
            </div>

            {/* Row 2 — Actions */}
            <div className={styles.sectionLabel}>Actions</div>
            <div className={styles.actionRow}>
              <button className={styles.actionCard} onClick={handleCopy} aria-label="Copy link">
                <MaterialIcon name={copied ? 'check' : 'content_copy'} size={22} className={styles.actionIcon} aria-hidden="true" />
                <span className={styles.actionLabel}>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
              <button className={styles.actionCard} onClick={() => window.open(shareUrl, '_blank')} aria-label="Open in new tab">
                <MaterialIcon name="open_in_new" size={22} className={styles.actionIcon} aria-hidden="true" />
                <span className={styles.actionLabel}>Open</span>
              </button>
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button className={styles.actionCard} onClick={handleNativeShare} aria-label="Share via system share sheet">
                  <MaterialIcon name="ios_share" size={22} className={styles.actionIcon} aria-hidden="true" />
                  <span className={styles.actionLabel}>Share…</span>
                </button>
              )}
              <button
                className={`${styles.actionCard} ${styles.actionCardDanger}`}
                onClick={handleRevoke}
                disabled={revoking}
                aria-label="Revoke share link"
              >
                <MaterialIcon name="link_off" size={22} className={styles.actionIconDanger} aria-hidden="true" />
                <span className={styles.actionLabelDanger}>{revoking ? 'Revoking…' : 'Revoke'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
