/**
 * Chat Page — IRC-style group chat (Level 1+)
 *
 * Uses DBAL irc_channel + irc_message entities.
 * Falls back to localStorage-backed mock when DBAL is offline.
 */
'use client'

import { LevelGate } from '@/components/layout/LevelGate'
import { WorkspacePageSlot } from '@/components/workspace/WorkspacePageSlot'
import { IrcChatShell } from '@/components/irc-webchat'
import styles from './page.module.scss'

export function ChatContent() {
  return (
    <div className={styles.wrapper}>
      <IrcChatShell />
    </div>
  )
}

export default function ChatPage() {
  return (
    <WorkspacePageSlot path="/irc">
      <LevelGate minLevel={1} levelName="User">
        <ChatContent />
      </LevelGate>
    </WorkspacePageSlot>
  )
}
