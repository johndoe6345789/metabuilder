/**
 * IRC Webchat type definitions
 * Used by DBAL irc_message / irc_channel entities
 */

export interface IrcChannel {
  id: string
  name: string
  description?: string
  tenantId: string
  memberCount?: number
}

export interface IrcMessage {
  id: string
  channelId: string
  content: string
  createdBy: string
  tenantId: string
  /** ISO timestamp or epoch ms */
  createdAt: string | number
  /** 'message' | 'system' | 'me' | 'join' | 'leave' */
  type?: string
}

export interface IrcChatState {
  channels: IrcChannel[]
  messages: IrcMessage[]
  activeChannelId: string | null
  loading: boolean
  error: string | null
}
