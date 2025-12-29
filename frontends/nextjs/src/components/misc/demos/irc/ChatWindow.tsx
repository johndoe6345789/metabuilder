import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  ScrollArea,
} from '@/components/ui'
import { Gear, PaperPlaneTilt, SignOut, Users } from '@phosphor-icons/react'
import { UserList } from './UserList'
import type { ChatMessage } from './types'

interface ChatWindowProps {
  channelName: string
  messages: ChatMessage[]
  formattedTimes: Record<string, string>
  onlineUsers: string[]
  inputMessage: string
  onInputChange: (value: string) => void
  onSendMessage: () => void
  onToggleSettings: () => void
  showSettings: boolean
  onClose?: () => void
  onInputKeyPress?: (event: React.KeyboardEvent) => void
}

export function ChatWindow({
  channelName,
  messages,
  formattedTimes,
  onlineUsers,
  inputMessage,
  onInputChange,
  onSendMessage,
  onToggleSettings,
  showSettings,
  onClose,
  onInputKeyPress,
}: ChatWindowProps) {
  const getMessageStyle = (message: ChatMessage) => {
    if (
      message.type === 'system' ||
      message.type === 'join' ||
      message.type === 'leave' ||
      message.type === 'command'
    ) {
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
              {onlineUsers.length}
            </Badge>
            <Button size="sm" variant="ghost" onClick={onToggleSettings}>
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
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2 font-mono text-sm">
              {messages.map(message => (
                <div key={message.id} className={getMessageStyle(message)}>
                  {message.type === 'message' && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground shrink-0">
                        {formattedTimes[message.id] || ''}
                      </span>
                      <span className="font-semibold shrink-0 text-primary">
                        &lt;{message.username}&gt;
                      </span>
                      <span className="break-words">{message.message}</span>
                    </div>
                  )}

                  {message.type === 'system' && message.username === 'System' && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground shrink-0">
                        {formattedTimes[message.id] || ''}
                      </span>
                      <span>*** {message.message}</span>
                    </div>
                  )}

                  {message.type === 'system' && message.username !== 'System' && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground shrink-0">
                        {formattedTimes[message.id] || ''}
                      </span>
                      <span className="text-accent">
                        * {message.username} {message.message}
                      </span>
                    </div>
                  )}

                  {(message.type === 'join' || message.type === 'leave') && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground shrink-0">
                        {formattedTimes[message.id] || ''}
                      </span>
                      <span
                        className={message.type === 'join' ? 'text-green-500' : 'text-orange-500'}
                      >
                        --&gt; {message.message}
                      </span>
                    </div>
                  )}

                  {message.type === 'command' && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground shrink-0">
                        {formattedTimes[message.id] || ''}
                      </span>
                      <span className="text-muted-foreground">{message.message}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {showSettings && (
            <div className="w-48 border-l border-border p-4 bg-muted/20">
              <h4 className="font-semibold text-sm mb-3">Online Users</h4>
              <UserList users={onlineUsers} />
            </div>
          )}
        </div>

        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={event => onInputChange(event.target.value)}
              onKeyPress={onInputKeyPress}
              placeholder="Type a message... (/help for commands)"
              className="flex-1 font-mono"
            />
            <Button onClick={onSendMessage} size="icon">
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
