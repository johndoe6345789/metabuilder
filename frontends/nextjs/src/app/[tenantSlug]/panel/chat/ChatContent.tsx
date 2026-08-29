'use client'

import { IrcChatShell } from '@/components/irc-webchat'
import styles from './page.module.scss'

/**
 * IRC-style group chat. Backed by the DBAL irc_channel and irc_message
 * entities, with a localStorage-backed fallback while DBAL is offline.
 */
export function ChatContent() {
  return (
    <div className={styles.wrapper}>
      <IrcChatShell />
    </div>
  )
}
