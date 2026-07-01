/**
 * ChatPanel — channel header + message list + input
 */
'use client'

import { useCallback } from 'react'
import { Typography, Chip } from '@/m3'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import type { IrcChannel, IrcMessage } from './types'
import styles from './ChatPanel.module.scss'

interface Props {
  channel: IrcChannel | null
  messages: IrcMessage[]
  username: string
  onSendMessage: (content: string, username: string) => Promise<void>
  onAddLocalMessage: (msg: IrcMessage) => void
  onClear: () => void
}

export function ChatPanel({
  channel, messages, username,
  onSendMessage, onAddLocalMessage, onClear,
}: Props) {
  const handleSend = useCallback(
    async (content: string) => { await onSendMessage(content, username) },
    [onSendMessage, username],
  )

  const handleSystem = useCallback(
    (partial: Omit<IrcMessage, 'id' | 'channelId' | 'tenantId'>) => {
      onAddLocalMessage({
        ...partial,
        id: `local_${Date.now()}_${Math.random()}`,
        channelId: channel?.id ?? '',
        tenantId: channel?.tenantId ?? 'default',
      })
    },
    [onAddLocalMessage, channel],
  )

  if (channel == null) {
    return (
      <div className={styles.placeholder}>
        <Typography variant="body1" color="text.secondary">
          Select a channel to start chatting
        </Typography>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.channelHeader}>
        <Typography variant="subtitle1" className={styles.channelName}>
          <span className={styles.hash}>#</span>{channel.name}
        </Typography>
        {(channel.memberCount ?? 0) > 0 && (
          <Chip
            label={`${channel.memberCount} members`}
            size="small"
            variant="outlined"
          />
        )}
      </div>
      <MessageList messages={messages} channelName={channel.name} />
      <ChatInput
        onSend={content => { void handleSend(content) }}
        onSystemMessage={handleSystem}
        onClear={onClear}
        username={username}
        memberCount={channel.memberCount ?? 0}
      />
    </div>
  )
}
