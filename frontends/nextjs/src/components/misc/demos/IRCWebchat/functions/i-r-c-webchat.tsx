import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import type { User } from '@/lib/level-types'
import { ChatWindow } from './irc/ChatWindow'
import { useChatInput, useFormattedTimes } from './irc/hooks'
import type { ChatMessage } from './irc/types'

export function IRCWebchat({ user, channelName = 'general', onClose }: IRCWebchatProps) {
  const [messages, setMessages] = useKV<ChatMessage[]>(`chat_${channelName}`, [])
  const [onlineUsers, setOnlineUsers] = useKV<string[]>(`chat_${channelName}_users`, [])
  const [showSettings, setShowSettings] = useState(false)
  const { inputMessage, setInputMessage, handleKeyPress } = useChatInput(handleSendMessage)
  const formattedTimes = useFormattedTimes(messages || [], formatTime)

  useEffect(() => {
    addUserToChannel()
    return () => {
      removeUserFromChannel()
    }
  }, [])

  const addUserToChannel = () => {
    setOnlineUsers((current) => {
      if (!current) return [user.username]
      if (current.includes(user.username)) return current
      const updated = [...current, user.username]
      
      setMessages((msgs) => [
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
      
      return updated
    })
  }

  const removeUserFromChannel = () => {
    setOnlineUsers((current) => {
      if (!current) return []
      const updated = current.filter((u) => u !== user.username)
      
      setMessages((msgs) => [
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
      
      return updated
    })
  }

  function handleSendMessage() {
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

      setMessages((current) => [...(current || []), newMessage])
    }

    setInputMessage('')
  }

  const handleCommand = (command: string) => {
    const parts = command.split(' ')
    const cmd = parts[0].toLowerCase()

    const systemMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      username: 'System',
      userId: 'system',
      message: '',
      timestamp: Date.now(),
      type: 'system',
    }

    if (cmd === '/help') {
      systemMessage.message = 'Available commands: /help, /users, /clear, /me <action>'
      setMessages((current) => [...(current || []), systemMessage])
    } else if (cmd === '/users') {
      systemMessage.message = `Online users (${onlineUsers?.length || 0}): ${(onlineUsers || []).join(', ')}`
      setMessages((current) => [...(current || []), systemMessage])
    } else if (cmd === '/clear') {
      setMessages([])
    } else if (cmd === '/me') {
      const action = parts.slice(1).join(' ')
      if (action) {
        const actionMessage: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random()}`,
          username: user.username,
          userId: user.id,
          message: action,
          timestamp: Date.now(),
          type: 'system',
        }
        setMessages((current) => [...(current || []), actionMessage])
      }
    } else {
      systemMessage.message = `Unknown command: ${cmd}. Type /help for available commands.`
      setMessages((current) => [...(current || []), systemMessage])
    }
  }

  function formatTime(timestamp: number) {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <ChatWindow
      channelName={channelName}
      messages={messages || []}
      formattedTimes={formattedTimes}
      onlineUsers={onlineUsers || []}
      inputMessage={inputMessage}
      onInputChange={setInputMessage}
      onSendMessage={handleSendMessage}
      onToggleSettings={() => setShowSettings(!showSettings)}
      showSettings={showSettings}
      onClose={onClose}
      onInputKeyPress={handleKeyPress}
    />
  )
}
