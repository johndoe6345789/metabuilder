/**
 * IrcChatShell — channel list (left) + chat panel (right)
 * Viewport-fit; no page scroll.
 */
'use client'

import { useState, useCallback } from 'react'
import { Typography } from '@/m3'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { ChannelList } from './ChannelList'
import { ChatPanel } from './ChatPanel'
import { useIrcChat } from './useIrcChat'
import type { IrcMessage } from './types'
import styles from './IrcChatShell.module.scss'

const toMs = (t: string | number) =>
  typeof t === 'number' ? t : new Date(t).getTime()

export function IrcChatShell() {
  const auth     = useAuthContext()
  const username = auth.user?.username ?? auth.user?.name ?? 'guest'
  const userId   = auth.user?.id ?? 'anonymous'

  const {
    channels, messages, activeChannelId, loading, error,
    setActiveChannelId, sendMessage, clearLocalMessages,
  } = useIrcChat()

  const [localMsgs, setLocalMsgs] = useState<IrcMessage[]>([])

  const addLocal = useCallback((msg: IrcMessage) => {
    setLocalMsgs(p => [...p, msg])
  }, [])

  const handleClear = useCallback(() => {
    clearLocalMessages(); setLocalMsgs([])
  }, [clearLocalMessages])

  const activeChannel = channels.find(c => c.id === activeChannelId) ?? null
  const allMessages = [...messages, ...localMsgs].sort(
    (a, b) => toMs(a.createdAt) - toMs(b.createdAt),
  )

  return (
    <div className={styles.shell}>
      <div className={styles.titleBar}>
        <Typography variant="h6" className={styles.title}>IRC Chat</Typography>
        {error != null && (
          <Typography variant="caption" className={styles.offlineBadge}>
            offline mode
          </Typography>
        )}
      </div>
      {loading ? (
        <div className={styles.loading}>
          <Typography variant="body2" color="text.secondary">
            Connecting…
          </Typography>
        </div>
      ) : (
        <div className={styles.body}>
          <ChannelList
            channels={channels}
            activeChannelId={activeChannelId}
            onSelect={id => { setActiveChannelId(id); setLocalMsgs([]) }}
            userId={userId}
          />
          <ChatPanel
            channel={activeChannel}
            messages={allMessages}
            username={username}
            onSendMessage={sendMessage}
            onAddLocalMessage={addLocal}
            onClear={handleClear}
          />
        </div>
      )}
    </div>
  )
}
