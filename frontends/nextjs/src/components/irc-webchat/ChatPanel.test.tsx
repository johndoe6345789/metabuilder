import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ChatPanel } from './ChatPanel'
import type { IrcChannel } from './types'

const general: IrcChannel = {
  id: 'c1',
  name: 'general',
  tenantId: 'acme',
  memberCount: 5,
}

const panelProps = () => ({
  channel: general,
  messages: [],
  username: 'alex',
  onSendMessage: vi.fn().mockResolvedValue(undefined),
  onAddLocalMessage: vi.fn(),
  onClear: vi.fn(),
})

beforeEach(() => {
  Element.prototype.scrollIntoView = () => undefined
})

describe('ChatPanel', () => {
  it('shows a placeholder when no channel is selected', () => {
    render(<ChatPanel {...panelProps()} channel={null} />)
    expect(screen.getByText('Select a channel to start chatting')).toBeTruthy()
  })

  it('shows the channel name and member count', () => {
    render(<ChatPanel {...panelProps()} />)
    expect(screen.getByText('general')).toBeTruthy()
    expect(screen.getByText('5 members')).toBeTruthy()
  })

  it('hides the member badge with zero members', () => {
    render(
      <ChatPanel {...panelProps()} channel={{ ...general, memberCount: 0 }} />
    )
    expect(screen.queryByText(/members/)).toBeNull()
  })

  it('sends a typed message with the username attached', () => {
    const p = panelProps()
    render(<ChatPanel {...p} />)
    fireEvent.change(
      screen.getByPlaceholderText('Type a message... (/help for commands)'),
      { target: { value: 'hello' } }
    )
    fireEvent.click(screen.getByLabelText('Send message'))
    expect(p.onSendMessage).toHaveBeenCalledWith('hello', 'alex')
  })

  it('adds a locally-generated system message scoped to the channel', () => {
    const p = panelProps()
    render(<ChatPanel {...p} />)
    fireEvent.change(
      screen.getByPlaceholderText('Type a message... (/help for commands)'),
      { target: { value: '/clear' } }
    )
    fireEvent.click(screen.getByLabelText('Send message'))
    expect(p.onClear).toHaveBeenCalledOnce()
  })
})
