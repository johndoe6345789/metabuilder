/**
 * MessageList — scrollable message area with auto-scroll to bottom
 */
'use client'

import { useEffect, useRef } from 'react'
import { Typography } from '@/m3'
import { MessageItem } from './MessageItem'
import type { IrcMessage } from './types'
import styles from './MessageList.module.scss'

interface Props {
  messages: IrcMessage[]
  channelName: string
}

export function MessageList({ messages, channelName }: Props) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className={styles.empty}>
        <Typography variant="body2" color="text.secondary">
          No messages in #{channelName} yet. Say hello!
        </Typography>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {messages.map(msg => (
        <MessageItem key={msg.id} message={msg} />
      ))}
      <div ref={endRef} />
    </div>
  )
}
