import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { PaperPlaneTilt, Users, SignOut, Gear } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import type { User } from '@/lib/level-types'

interface ChatMessage {
  id: string
  username: string
  userId: string
  message: string
  timestamp: number
  type: 'message' | 'system' | 'join' | 'leave'
}

interface IRCWebchatProps {
  user: User
  channelName?: string
  onClose?: () => void
}

export function IRCWebchat({ user, channelName = 'general', onClose }: IRCWebchatProps) {
  const [messages, setMessages] = useKV<ChatMessage[]>(`chat_${channelName}`, [])
  const [onlineUsers, setOnlineUsers] = useKV<string[]>(`chat_${channelName}_users`, [])
  const [inputMessage, setInputMessage] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    addUserToChannel()
    return () => {
      removeUserFromChannel()
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

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

  const handleSendMessage = () => {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const getMessageStyle = (msg: ChatMessage) => {
    if (msg.type === 'system' || msg.type === 'join' || msg.type === 'leave') {
      return 'text-muted-foreground italic text-sm'
    }
    return ''
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b border-border pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="font-mono">#</span>
            {channelName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5">
              <Users size={14} />
              {onlineUsers?.length || 0}
            </Badge>
            <Button size="sm" variant="ghost" onClick={() => setShowSettings(!showSettings)}>
              <Gear size={16} />
            </Button>
            {onClose && (
              <Button size="sm" variant="ghost" onClick={onClose}>
                <SignOut size={16} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-2 font-mono text-sm">
              {(messages || []).map((msg) => (
                <div key={msg.id} className={getMessageStyle(msg)}>
                  {msg.type === 'message' && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground shrink-0">{formatTime(msg.timestamp)}</span>
                      <span className="font-semibold shrink-0 text-primary">&lt;{msg.username}&gt;</span>
                      <span className="break-words">{msg.message}</span>
                    </div>
                  )}
                  {msg.type === 'system' && msg.username === 'System' && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground shrink-0">{formatTime(msg.timestamp)}</span>
                      <span>*** {msg.message}</span>
                    </div>
                  )}
                  {msg.type === 'system' && msg.username !== 'System' && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground shrink-0">{formatTime(msg.timestamp)}</span>
                      <span className="text-accent">* {msg.username} {msg.message}</span>
                    </div>
                  )}
                  {(msg.type === 'join' || msg.type === 'leave') && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground shrink-0">{formatTime(msg.timestamp)}</span>
                      <span className={msg.type === 'join' ? 'text-green-500' : 'text-orange-500'}>
                        --&gt; {msg.message}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {showSettings && (
            <div className="w-48 border-l border-border p-4 bg-muted/20">
              <h4 className="font-semibold text-sm mb-3">Online Users</h4>
              <div className="space-y-1.5 text-sm">
                {(onlineUsers || []).map((username) => (
                  <div key={username} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>{username}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message... (/help for commands)"
              className="flex-1 font-mono"
            />
            <Button onClick={handleSendMessage} size="icon">
              <PaperPlaneTilt size={18} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send. Type /help for commands.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
