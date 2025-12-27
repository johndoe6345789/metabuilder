export type ChatMessageType = 'message' | 'system' | 'join' | 'leave' | 'command'

export interface ChatMessage {
  id: string
  username: string
  userId: string
  message: string
  timestamp: number
  type: ChatMessageType
}
