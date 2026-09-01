import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ChannelList } from './ChannelList'
import type { IrcChannel } from './types'

function mockFetch() {
  const fetchFn = vi.fn(async () => ({ ok: true }) as Response)
  vi.stubGlobal('fetch', fetchFn)
  return fetchFn
}

afterEach(() => {
  vi.unstubAllGlobals()
})

const general: IrcChannel = {
  id: 'c1',
  name: 'general',
  tenantId: 'acme',
  memberCount: 5,
}

const list = (props: Partial<Parameters<typeof ChannelList>[0]> = {}) =>
  render(
    <ChannelList
      channels={[general]}
      activeChannelId={null}
      onSelect={vi.fn()}
      userId="u1"
      {...props}
    />
  )

describe('ChannelList', () => {
  it('renders each channel by name', () => {
    mockFetch()
    list()
    expect(screen.getByText('general')).toBeTruthy()
  })

  it('shows a member-count badge only when it is above zero', () => {
    mockFetch()
    list({
      channels: [general, { ...general, id: 'c2', name: 'empty', memberCount: 0 }],
    })
    expect(screen.getByText('5')).toBeTruthy()
    expect(screen.getByText('empty')).toBeTruthy()
  })

  it('marks the active channel', () => {
    mockFetch()
    list({ activeChannelId: 'c1' })
    expect(screen.getByText('general').closest('li')?.className).toContain(
      'active'
    )
  })

  it('selects a channel and joins it via DBAL on click', () => {
    const fetchFn = mockFetch()
    const onSelect = vi.fn()
    list({ onSelect, tenantId: 'acme' })
    fireEvent.click(screen.getByText('general'))
    expect(onSelect).toHaveBeenCalledWith('c1')
    expect(fetchFn).toHaveBeenCalledWith(
      expect.stringContaining('/acme/irc/irc_membership'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('selects on Enter/Space from the keyboard, ignores other keys', () => {
    mockFetch()
    const onSelect = vi.fn()
    list({ onSelect })
    fireEvent.keyDown(screen.getByText('general'), { key: 'Enter' })
    fireEvent.keyDown(screen.getByText('general'), { key: ' ' })
    fireEvent.keyDown(screen.getByText('general'), { key: 'Tab' })
    expect(onSelect).toHaveBeenCalledTimes(2)
  })

  it('does not throw when the join request fails', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline')
      })
    )
    list()
    expect(() => fireEvent.click(screen.getByText('general'))).not.toThrow()
  })
})
