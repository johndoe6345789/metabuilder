import { MaterialIcon } from '@metabuilder/components/m3'
import styles from './share-dialog.module.scss'

interface ShareDialogActionsProps {
  shareUrl: string
  copied: boolean
  revoking: boolean
  onCopy: () => void
  onNativeShare: () => void
  onRevoke: () => void
}

export function ShareDialogActions({
  shareUrl,
  copied,
  revoking,
  onCopy,
  onNativeShare,
  onRevoke,
}: ShareDialogActionsProps) {
  return (
    <div className={styles.actionRow}>
      <button
        className={styles.actionCard}
        onClick={onCopy}
        aria-label="Copy link"
      >
        <MaterialIcon
          name={copied ? 'check' : 'content_copy'}
          size={22}
          className={styles.actionIcon}
          aria-hidden="true"
        />
        <span className={styles.actionLabel}>
          {copied ? 'Copied!' : 'Copy Link'}
        </span>
      </button>
      <button
        className={styles.actionCard}
        onClick={() => window.open(shareUrl, '_blank')}
        aria-label="Open in new tab"
      >
        <MaterialIcon
          name="open_in_new"
          size={22}
          className={styles.actionIcon}
          aria-hidden="true"
        />
        <span className={styles.actionLabel}>Open</span>
      </button>
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button
          className={styles.actionCard}
          onClick={onNativeShare}
          aria-label="Share via system share sheet"
        >
          <MaterialIcon
            name="ios_share"
            size={22}
            className={styles.actionIcon}
            aria-hidden="true"
          />
          <span className={styles.actionLabel}>Share…</span>
        </button>
      )}
      <button
        className={`${styles.actionCard} ${styles.actionCardDanger}`}
        onClick={onRevoke}
        disabled={revoking}
        aria-label="Revoke share link"
      >
        <MaterialIcon
          name="link_off"
          size={22}
          className={styles.actionIconDanger}
          aria-hidden="true"
        />
        <span className={styles.actionLabelDanger}>
          {revoking ? 'Revoking…' : 'Revoke'}
        </span>
      </button>
    </div>
  )
}
