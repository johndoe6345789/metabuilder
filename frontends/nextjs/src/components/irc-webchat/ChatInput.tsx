/**
 * ChatInput — message text field + send button
 * Slash commands (/help, /clear, /me, /users) handled by handleCommand
 */
'use client'

import { useState, type KeyboardEvent } from 'react'
import { TextField, IconButton } from '@/m3'
import type { IrcMessage } from './types'
import { handleCommand } from './handleCommand'
import styles from './ChatInput.module.scss'

interface Props {
  onSend: (content: string) => void
  onSystemMessage: (
    msg: Omit<IrcMessage, 'id' | 'channelId' | 'tenantId'>
  ) => void
  onClear: () => void
  username: string
  memberCount: number
}

export function ChatInput({
  onSend,
  onSystemMessage,
  onClear,
  username,
  memberCount,
}: Props) {
  const [value, setValue] = useState('')

  function dispatch() {
    const trimmed = value.trim()
    if (trimmed === '') return
    setValue('')

    const wasCommand = handleCommand(
      trimmed,
      username,
      memberCount,
      onSystemMessage,
      onClear
    )
    if (!wasCommand) onSend(trimmed)
  }

  function handleKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      dispatch()
    }
  }

  return (
    <div className={styles.root}>
      <TextField
        fullWidth
        size="small"
        placeholder="Type a message... (/help for commands)"
        value={value}
        onChange={e => {
          setValue(e.target.value)
        }}
        onKeyDown={handleKey}
        className={styles.inputField}
      />
      <IconButton
        onClick={dispatch}
        disabled={value.trim() === ''}
        color="primary"
        aria-label="Send message"
        className={styles.sendBtn}
      >
        <span className="material-symbols-outlined">send</span>
      </IconButton>
    </div>
  )
}
