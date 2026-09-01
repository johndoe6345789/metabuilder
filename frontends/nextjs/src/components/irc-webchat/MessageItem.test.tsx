import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MessageItem } from './MessageItem'
import type { IrcMessage } from './types'

const base: IrcMessage = {
  id: 'm1',
  channelId: 'c1',
  content: 'hello there',
  createdBy: 'alex',
  tenantId: 'acme',
  createdAt: Date.now(),
}

describe('MessageItem', () => {
  it('renders a regular message with the sender in angle brackets', () => {
    render(<MessageItem message={base} />)
    expect(screen.getByText('<alex>')).toBeTruthy()
    expect(screen.getByText('hello there')).toBeTruthy()
  })

  it('renders an untyped message the same as "message"', () => {
    render(<MessageItem message={{ ...base, type: 'message' }} />)
    expect(screen.getByText('<alex>')).toBeTruthy()
  })

  it('renders a join notice with an arrow prefix', () => {
    render(
      <MessageItem message={{ ...base, type: 'join', content: 'alex joined' }} />
    )
    expect(screen.getByText(/alex joined/)).toBeTruthy()
    expect(screen.queryByText('<alex>')).toBeNull()
  })

  it('renders a leave notice', () => {
    render(
      <MessageItem
        message={{ ...base, type: 'leave', content: 'alex left' }}
      />
    )
    expect(screen.getByText(/alex left/)).toBeTruthy()
  })

  it('renders a system message with a *** prefix', () => {
    render(
      <MessageItem
        message={{ ...base, type: 'system', content: 'Topic changed' }}
      />
    )
    expect(screen.getByText('*** Topic changed')).toBeTruthy()
  })

  it('renders a /me action attributed to the sender', () => {
    render(
      <MessageItem message={{ ...base, type: 'me', content: 'waves' }} />
    )
    expect(screen.getByText('* alex waves')).toBeTruthy()
  })

  it('formats createdAt as an ISO string the same as a number', () => {
    render(<MessageItem message={{ ...base, createdAt: '2026-01-01T00:00:00Z' }} />)
    expect(screen.getByText('<alex>')).toBeTruthy()
  })
})
