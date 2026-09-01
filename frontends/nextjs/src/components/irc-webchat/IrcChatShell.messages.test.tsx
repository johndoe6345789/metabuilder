import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render } from '@testing-library/react'
import {
  authMod,
  chatHook,
  listMod,
  panelMod,
  msg,
  makeBaseChat,
  lastChat,
  lastList,
} from './irc-chat-shell-test-mocks'

vi.mock('@/app/_components/auth-provider/auth-provider-component', () => ({
  useAuthContext: authMod.useAuthContext,
}))
vi.mock('./useIrcChat', () => chatHook)
vi.mock('./ChannelList', () => listMod)
vi.mock('./ChatPanel', () => panelMod)

import { IrcChatShell } from './IrcChatShell'

let baseChat: ReturnType<typeof makeBaseChat>

beforeEach(() => {
  vi.clearAllMocks()
  baseChat = makeBaseChat()
  authMod.useAuthContext.mockReturnValue({ user: null })
  chatHook.useIrcChat.mockReturnValue(baseChat)
})

describe('IrcChatShell local message handling', () => {
  it('merges hook + local messages sorted by time', () => {
    chatHook.useIrcChat.mockReturnValue({
      ...baseChat,
      messages: [msg('m2', 2000)],
    })
    render(<IrcChatShell />)
    act(() => {
      lastChat().onAddLocalMessage(msg('m1', 1000))
    })
    expect(lastChat().messages.map(m => m.id)).toEqual(['m1', 'm2'])
  })

  it('selecting a channel forwards id and clears local messages', () => {
    render(<IrcChatShell />)
    act(() => {
      lastChat().onAddLocalMessage(msg('local1', 1))
    })
    act(() => {
      lastList().onSelect('ch2')
    })
    expect(baseChat.setActiveChannelId).toHaveBeenCalledWith('ch2')
    expect(lastChat().messages).toHaveLength(0)
  })

  it('clearing calls clearLocalMessages and empties local messages', () => {
    render(<IrcChatShell />)
    act(() => {
      lastChat().onAddLocalMessage(msg('local1', 1))
    })
    act(() => {
      lastChat().onClear()
    })
    expect(baseChat.clearLocalMessages).toHaveBeenCalledOnce()
    expect(lastChat().messages).toHaveLength(0)
  })

  it('threads sendMessage straight through to ChatPanel', () => {
    render(<IrcChatShell />)
    expect(lastChat().onSendMessage).toBe(baseChat.sendMessage)
  })
})
