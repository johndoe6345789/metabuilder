/**
 * MessageItem — single IRC message row
 * Formats: [HH:MM] <user> text | * user action | *** system
 */
import { Typography } from '@/m3'
import type { IrcMessage } from './types'
import styles from './MessageItem.module.scss'

interface Props {
  message: IrcMessage
}

function formatTime(ts: string | number): string {
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function MessageItem({ message }: Props) {
  const { content, createdBy, createdAt, type } = message
  const time = formatTime(createdAt)

  if (type === 'join' || type === 'leave') {
    return (
      <div className={styles.row}>
        <span className={styles.ts}>{time}</span>
        <span className={`${styles.system} ${type === 'join' ? styles.join : styles.leave}`}>
          --&gt; {content}
        </span>
      </div>
    )
  }

  if (type === 'system') {
    return (
      <div className={styles.row}>
        <span className={styles.ts}>{time}</span>
        <Typography
          variant="body2"
          component="span"
          className={styles.systemText}
        >
          *** {content}
        </Typography>
      </div>
    )
  }

  if (type === 'me') {
    return (
      <div className={styles.row}>
        <span className={styles.ts}>{time}</span>
        <Typography
          variant="body2"
          component="span"
          className={styles.meText}
        >
          * {createdBy} {content}
        </Typography>
      </div>
    )
  }

  return (
    <div className={styles.row}>
      <span className={styles.ts}>{time}</span>
      <span className={styles.nick}>&lt;{createdBy}&gt;</span>
      <Typography variant="body2" component="span" className={styles.text}>
        {content}
      </Typography>
    </div>
  )
}
