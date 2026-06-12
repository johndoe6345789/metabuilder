'use client'

import { MaterialIcon } from '@metabuilder/components/fakemui'
import type { Snippet } from '@/lib/types'
import { useShareDialog } from './hooks/useShareDialog'
import { ShareDialogActions } from './ShareDialogActions'
import { ShareDialogEmailApps } from './ShareDialogEmailApps'
import styles from './share-dialog.module.scss'

interface ShareDialogProps {
  open: boolean
  onClose: () => void
  snippet: Snippet
}

export function ShareDialog({ open, onClose, snippet }: ShareDialogProps) {
  const vm = useShareDialog(snippet)

  if (!open) return null

  const { shareUrl, generating, revoking, copied } = vm
  const encodedTitle = encodeURIComponent(`Check out: ${snippet.title}`)
  const encodedUrl = shareUrl ? encodeURIComponent(shareUrl) : ''

  return (
    <div
      className={styles.overlay}
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Share snippet"
    >
      <div className={styles.dialog}>
        <div className={styles.header}>
          <MaterialIcon
            name="share"
            size={20}
            className={styles.headerIcon}
            aria-hidden="true"
          />
          <span className={styles.headerTitle}>Share snippet</span>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <MaterialIcon name="close" size={20} />
          </button>
        </div>

        {!shareUrl ? (
          <div className={styles.privateState}>
            <div className={styles.privateBadge}>
              <MaterialIcon
                name="lock"
                size={32}
                className={styles.lockIcon}
                aria-hidden="true"
              />
              <p className={styles.privateText}>This snippet is private</p>
              <p className={styles.privateHint}>
                Generate a secret link to share it with anyone — without
                exposing your snippet ID.
              </p>
            </div>
            <button
              className={styles.generateBtn}
              onClick={vm.handleGenerate}
              disabled={generating}
            >
              <MaterialIcon name="link" size={16} aria-hidden="true" />
              {generating ? 'Generating…' : 'Generate Share Link'}
            </button>
          </div>
        ) : (
          <>
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
                  className={`${styles.copyInlineBtn} ${
                    copied ? styles.copyInlineBtnDone : ''
                  }`}
                  onClick={vm.handleCopy}
                  aria-label="Copy link"
                >
                  <MaterialIcon
                    name={copied ? 'check' : 'content_copy'}
                    size={16}
                  />
                </button>
              </div>
            </div>

            <div className={styles.sectionLabel}>Send via</div>
            <ShareDialogEmailApps
              gmailUrl={`https://mail.google.com/mail/?view=cm&su=${encodedTitle}&body=${encodedUrl}`}
              outlookUrl={`https://outlook.live.com/mail/0/deeplink/compose?subject=${encodedTitle}&body=${encodedUrl}`}
              mailtoUrl={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
            />

            <div className={styles.sectionLabel}>Actions</div>
            <ShareDialogActions
              shareUrl={shareUrl}
              copied={copied}
              revoking={revoking}
              onCopy={vm.handleCopy}
              onNativeShare={vm.handleNativeShare}
              onRevoke={vm.handleRevoke}
            />
          </>
        )}
      </div>
    </div>
  )
}
