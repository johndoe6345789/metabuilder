import { useKV } from '@github/spark/hooks'
import { useEffect,useState } from 'react'

import type { User } from '@/lib/level-types'

import { ChatWindow } from './irc/ChatWindow'
import { useChatInput, useFormattedTimes } from './irc/hooks'
import type { ChatMessage } from './irc/types'

export function handleSendMessage() {
  const trimmed = inputMessage.trim()
  if (!trimmed) return

  if (trimmed.startsWith('/')) {
    handleCommand(trimmed)
  } else {
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      username: user.username,
      userId: user.id,
      message: trimmed,
      timestamp: Date.now(),
      type: 'message',
    }

    setMessages(current => [...(current || []), newMessage])
  }

  setInputMessage('')
}
