import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MessageList } from './MessageList'
import type { IrcMessage } from './types'

beforeEach(() => {
  Element.prototype.scrollIntoView = () => undefined
})

const msg: IrcMessage = {
  id: 'm1',
  channelId: 'c1',
  content: 'hello there',
  createdBy: 'alex',
  tenantId: 'acme',
  createdAt: Date.now(),
}

describe('MessageList', () => {
  it('shows an empty-state hint scoped to the channel name', () => {
    render(<MessageList messages={[]} channelName="general" />)
    expect(screen.getByText(/No messages in #general yet/)).toBeTruthy()
  })

  it('renders one MessageItem per message', () => {
    render(
      <MessageList
        messages={[msg, { ...msg, id: 'm2', content: 'second' }]}
        channelName="general"
      />
    )
    expect(screen.getByText('hello there')).toBeTruthy()
    expect(screen.getByText('second')).toBeTruthy()
  })
})
