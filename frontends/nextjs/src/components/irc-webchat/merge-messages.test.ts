import { describe, expect, it } from 'vitest'

import { mergeMessages, toMs } from './merge-messages'
import type { IrcMessage } from './types'

const msg = (id: string, createdAt: string | number): IrcMessage => ({
  id,
  channelId: 'c1',
  content: id,
  createdBy: 'rosa',
  tenantId: 'acme',
  createdAt,
})

describe('toMs', () => {
  it('takes a number as it is', () => {
    expect(toMs(1751500000000)).toBe(1751500000000)
  })

  it('reads an ISO timestamp', () => {
    expect(toMs('2025-07-02T23:46:40.000Z')).toBe(1751500000000)
  })

  // NaN comparisons are false, so an unreadable date left the message
  // wherever the sort happened to put it -- often above everything.
  it('puts an unreadable date at the beginning of time', () => {
    expect(toMs('whenever')).toBe(0)
  })
})

describe('mergeMessages', () => {
  it('puts the oldest first, whichever side it came from', () => {
    const merged = mergeMessages(
      [msg('server', '2025-07-02T00:00:00.000Z')],
      [msg('local', '2025-07-01T00:00:00.000Z')]
    )
    expect(merged.map(m => m.id)).toEqual(['local', 'server'])
  })

  it('mixes the two orderings correctly', () => {
    const merged = mergeMessages(
      [msg('a', 1), msg('c', 3)],
      [msg('b', 2), msg('d', 4)]
    )
    expect(merged.map(m => m.id)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('is empty for nothing on either side', () => {
    expect(mergeMessages([], [])).toEqual([])
  })
})
