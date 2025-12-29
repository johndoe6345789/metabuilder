import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import type { User } from '@/lib/level-types'
import { getDeclarativeRenderer } from '@/lib/rendering-lib/declarative-component-renderer'
import { ChatWindow } from './irc/ChatWindow'
import { useChatInput, useFormattedTimes } from './irc/hooks'
import type { ChatMessage } from './irc/types'

export async function handleSendMessage() {
    const trimmed = inputMessage.trim()
    if (!trimmed) return

    if (trimmed.startsWith('/')) {
      await handleCommand(trimmed)
    } else {
      try {
        const newMessage = await renderer.executeLuaScript('lua_irc_send_message', [
          `chat_${channelName}`,
          user.username,
          user.id,
          trimmed,
        ])

        if (newMessage) {
          setMessages((current) => [...(current || []), newMessage])
        }
      } catch (error) {
        console.error('Error executing send message script:', error)
        const fallbackMessage: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random()}`,
          username: user.username,
          userId: user.id,
          message: trimmed,
          timestamp: Date.now(),
          type: 'message',
        }
        setMessages((current) => [...(current || []), fallbackMessage])
      }
    }

    setInputMessage('')
  }
