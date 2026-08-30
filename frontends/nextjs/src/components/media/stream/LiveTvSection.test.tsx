import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const tv = vi.hoisted(() => ({
  channels: [] as { id: string; name: string; epgEntries: never[] }[],
  loading: false,
  error: null as string | null,
  watch: vi.fn(async () => 'https://stream'),
  stop: vi.fn(async () => {}),
}))

vi.mock('./useTvChannels', () => ({
  useTvChannels: () => tv,
}))

import { LiveTvSection } from './LiveTvSection'

describe('LiveTvSection', () => {
  it('shows a loading state', () => {
    tv.loading = true
    render(<LiveTvSection />)
    expect(screen.getByText('Loading channels…')).toBeTruthy()
    tv.loading = false
  })

  it('shows an error state', () => {
    tv.error = 'offline'
    render(<LiveTvSection />)
    expect(screen.getByText('offline')).toBeTruthy()
    tv.error = null
  })

  it('shows the empty-channels notice with no channels', () => {
    tv.channels = []
    render(<LiveTvSection />)
    expect(screen.getByText(/No channels yet/)).toBeTruthy()
  })

  it('renders the EPG grid once channels are loaded', () => {
    tv.channels = [{ id: 'a', name: 'News', epgEntries: [] }]
    render(<LiveTvSection />)
    expect(screen.getByText('News')).toBeTruthy()
  })
})
