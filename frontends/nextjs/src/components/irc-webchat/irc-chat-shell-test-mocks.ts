// Shared mock state + fixtures for IrcChatShell's split test files. Kept
// as .ts (no JSX) so it falls outside the 80-line .tsx guardrail.
import { createElement } from 'react'
import { vi } from 'vitest'
import type { IrcMessage } from './types'

export const authMod = { useAuthContext: vi.fn() }
export const chatHook = { useIrcChat: vi.fn() }
export const listMod = {
  ChannelList: vi.fn((_p: Record<string, unknown>) =>
    createElement('div', { 'data-testid': 'cl' })
  ),
}
export const panelMod = {
  ChatPanel: vi.fn((_p: Record<string, unknown>) =>
    createElement('div', { 'data-testid': 'cp' })
  ),
}

export interface ChatProps {
  channel: { id: string } | null
  messages: IrcMessage[]
  username: string
  onAddLocalMessage: (m: IrcMessage) => void
  onClear: () => void
  onSendMessage: unknown
}
export interface ListProps {
  userId: string
  onSelect: (id: string) => void
}

export const msg = (id: string, createdAt: number): IrcMessage => ({
  id,
  channelId: 'ch1',
  content: id,
  createdBy: 'a',
  tenantId: 'default',
  createdAt,
})

export const makeBaseChat = () => ({
  channels: [
    { id: 'ch1', name: 'general', tenantId: 'default' },
    { id: 'ch2', name: 'dev', tenantId: 'default' },
  ],
  messages: [] as IrcMessage[],
  activeChannelId: 'ch1' as string | null,
  loading: false,
  error: null as string | null,
  setActiveChannelId: vi.fn(),
  sendMessage: vi.fn(),
  clearLocalMessages: vi.fn(),
})

export const lastChat = () =>
  panelMod.ChatPanel.mock.calls.at(-1)?.[0] as unknown as ChatProps
export const lastList = () =>
  listMod.ChannelList.mock.calls.at(-1)?.[0] as unknown as ListProps
