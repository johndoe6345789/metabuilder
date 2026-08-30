import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { EpgGrid } from './EpgGrid'

const channel = (id: string, name: string) => ({
  id,
  name,
  channel_number: 0,
  is_live: true,
  viewers: 0,
  hls_url: '',
  dash_url: '',
  epgEntries: [
    {
      channel_id: id,
      channel_name: name,
      start_time: '2026-01-01T09:45:00Z',
      end_time: '2026-01-01T10:45:00Z',
      program: { id: `${id}-p1`, title: `${name} show` } as never,
    },
  ],
})

describe('EpgGrid', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders a row per channel', () => {
    render(
      <EpgGrid
        channels={[channel('a', 'News'), channel('b', 'Sport')]}
        busyId={null}
        onWatch={vi.fn()}
      />
    )
    expect(screen.getByText('News')).toBeTruthy()
    expect(screen.getByText('Sport')).toBeTruthy()
  })

  it('forwards a watch from a channel block up to the caller', () => {
    const onWatch = vi.fn()
    render(
      <EpgGrid channels={[channel('a', 'News')]} busyId={null} onWatch={onWatch} />
    )
    fireEvent.click(screen.getByText('News show'))
    expect(onWatch).toHaveBeenCalledWith('a', 'News')
  })
})
