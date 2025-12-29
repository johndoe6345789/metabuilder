import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import type { User } from '@/lib/level-types'
import { getDeclarativeRenderer } from '@/lib/rendering-lib/declarative-component-renderer'
import { ChatWindow } from './irc/ChatWindow'
import { useChatInput, useFormattedTimes } from './irc/hooks'
import type { ChatMessage } from './irc/types'

export function IRCWebchatDeclarative({
  user,
  channelName = 'general',
  onClose,
}: IRCWebchatDeclarativeProps) {
  const [messages, setMessages] = useKV<ChatMessage[]>(`chat_${channelName}`, [])
  const [onlineUsers, setOnlineUsers] = useKV<string[]>(`chat_${channelName}_users`, [])
  const [showSettings, setShowSettings] = useState(false)
  const { inputMessage, setInputMessage, handleKeyPress } = useChatInput(handleSendMessage)
  const renderer = getDeclarativeRenderer()
  const formattedTimes = useFormattedTimes(messages, formatTime)

  useEffect(() => {
    addUserToChannel()
    return () => {
      removeUserFromChannel()
    }
  }, [])

  const addUserToChannel = async () => {
    setOnlineUsers(current => {
      if (!current) return [user.username]
      if (current.includes(user.username)) return current
      return [...current, user.username]
    })

    try {
      const joinMsg = await renderer.executeLuaScript('lua_irc_user_join', [
        `chat_${channelName}`,
        user.username,
        user.id,
      ])

      if (joinMsg) {
        setMessages(msgs => [...(msgs || []), joinMsg])
      }
    } catch (error) {
      console.error('Error executing user join script:', error)
      setMessages(msgs => [
        ...(msgs || []),
        {
          id: `msg_${Date.now()}_${Math.random()}`,
          username: 'System',
          userId: 'system',
          message: `${user.username} has joined the channel`,
          timestamp: Date.now(),
          type: 'join',
        },
      ])
    }
  }

  const removeUserFromChannel = async () => {
    setOnlineUsers(current => {
      if (!current) return []
      return current.filter(u => u !== user.username)
    })

    try {
      const leaveMsg = await renderer.executeLuaScript('lua_irc_user_leave', [
        `chat_${channelName}`,
        user.username,
        user.id,
      ])

      if (leaveMsg) {
        setMessages(msgs => [...(msgs || []), leaveMsg])
      }
    } catch (error) {
      console.error('Error executing user leave script:', error)
      setMessages(msgs => [
        ...(msgs || []),
        {
          id: `msg_${Date.now()}_${Math.random()}`,
          username: 'System',
          userId: 'system',
          message: `${user.username} has left the channel`,
          timestamp: Date.now(),
          type: 'leave',
        },
      ])
    }
  }

  async function handleSendMessage() {
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
          setMessages(current => [...(current || []), newMessage])
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
        setMessages(current => [...(current || []), fallbackMessage])
      }
    }

    setInputMessage('')
  }

  const handleCommand = async (command: string) => {
    try {
      const response = await renderer.executeLuaScript('lua_irc_handle_command', [
        command,
        `chat_${channelName}`,
        user.username,
        onlineUsers || [],
      ])

      if (response) {
        if (response.message === 'CLEAR_MESSAGES' && response.type === 'command') {
          setMessages([])
        } else {
          setMessages(current => [...(current || []), response])
        }
      }
    } catch (error) {
      console.error('Error executing command script:', error)
      const parts = command.split(' ')
      const cmd = parts[0].toLowerCase()

      const systemMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random()}`,
        username: 'System',
        userId: 'system',
        message: `Unknown command: ${cmd}. Type /help for available commands.`,
        timestamp: Date.now(),
        type: 'system',
      }

      setMessages(current => [...(current || []), systemMessage])
    }
  }
}
