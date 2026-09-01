import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  authMod,
  chatHook,
  listMod,
  panelMod,
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

describe('IrcChatShell status and identity', () => {
  it('shows connecting state and no panels while loading', () => {
    chatHook.useIrcChat.mockReturnValue({ ...baseChat, loading: true })
    render(<IrcChatShell />)
    expect(screen.getByText('Connecting…')).toBeTruthy()
    expect(screen.queryByTestId('cl')).toBeNull()
  })

  it.each([
    ['DBAL offline', true],
    [null, false],
  ])('shows offline badge only on error (%s)', (error, expected) => {
    chatHook.useIrcChat.mockReturnValue({ ...baseChat, error })
    render(<IrcChatShell />)
    expect(screen.queryByText('offline mode') !== null).toBe(expected)
  })

  it('defaults username/userId when no user is present', () => {
    render(<IrcChatShell />)
    expect(lastChat().username).toBe('guest')
    expect(lastList().userId).toBe('anonymous')
  })

  it.each([
    [{ id: 'u1', username: 'alice', name: 'Alice' }, 'alice'],
    [{ id: 'u1', name: 'Alice' }, 'Alice'],
  ])('derives username from the auth user %#', (user, expected) => {
    authMod.useAuthContext.mockReturnValue({ user })
    render(<IrcChatShell />)
    expect(lastChat().username).toBe(expected)
    expect(lastList().userId).toBe('u1')
  })

  it.each([
    ['ch1', 'ch1'],
    ['missing', null],
  ])('resolves the active channel (%s)', (activeChannelId, expected) => {
    chatHook.useIrcChat.mockReturnValue({ ...baseChat, activeChannelId })
    render(<IrcChatShell />)
    expect(lastChat().channel?.id ?? null).toBe(expected)
  })
})
