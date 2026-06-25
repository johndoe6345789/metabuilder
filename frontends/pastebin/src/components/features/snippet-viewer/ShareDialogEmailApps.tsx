import { MaterialIcon } from '@metabuilder/components/m3'
import styles from './share-dialog.module.scss'

interface ShareDialogEmailAppsProps {
  gmailUrl: string
  outlookUrl: string
  mailtoUrl: string
}

export function ShareDialogEmailApps({
  gmailUrl,
  outlookUrl,
  mailtoUrl,
}: ShareDialogEmailAppsProps) {
  return (
    <div className={styles.appRow}>
      <a
        href={gmailUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.appCard}
        aria-label="Share via Gmail"
      >
        <MaterialIcon
          name="mail"
          size={24}
          className={styles.appIcon}
          aria-hidden="true"
        />
        <span className={styles.appLabel}>Gmail</span>
      </a>
      <a
        href={outlookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.appCard}
        aria-label="Share via Outlook"
      >
        <MaterialIcon
          name="mail_outline"
          size={24}
          className={styles.appIcon}
          aria-hidden="true"
        />
        <span className={styles.appLabel}>Outlook</span>
      </a>
      <a
        href={mailtoUrl}
        className={styles.appCard}
        aria-label="Share via email"
      >
        <MaterialIcon
          name="email"
          size={24}
          className={styles.appIcon}
          aria-hidden="true"
        />
        <span className={styles.appLabel}>Email</span>
      </a>
    </div>
  )
}
