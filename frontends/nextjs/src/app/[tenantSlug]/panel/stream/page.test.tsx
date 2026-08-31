import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

vi.mock('@/components/layout/LevelGate', () => ({
  LevelGate: ({ children }: { children: React.ReactNode }) => children,
}))
vi.mock('@/components/media/stream/AppsRow', () => ({
  AppsRow: () => <div>apps-row</div>,
}))
vi.mock('@/components/media/stream/useTvChannels', () => ({
  useTvChannels: () => ({ channels: [] }),
}))
vi.mock('@/components/media/stream/LiveTvSection', () => ({
  LiveTvSection: () => <div>tv-section</div>,
}))
vi.mock('@/components/media/stream/RadioSection', () => ({
  RadioSection: () => <div>radio-section</div>,
}))
vi.mock('@/components/media/RetroLauncher', () => ({
  RetroLauncher: () => <div>retro-section</div>,
}))

import StreamHubPage from './page'

describe('StreamHubPage', () => {
  it('renders the hero, apps row, nav, and TV section by default', () => {
    render(<StreamHubPage />)
    expect(screen.getByText('apps-row')).toBeTruthy()
    expect(screen.getByText('tv-section')).toBeTruthy()
  })

  it('switches to radio when its tab is clicked', () => {
    render(<StreamHubPage />)
    fireEvent.click(screen.getByRole('tab', { name: /Radio/ }))
    expect(screen.getByText('radio-section')).toBeTruthy()
  })

  it('switches to retro when its tab is clicked', () => {
    render(<StreamHubPage />)
    fireEvent.click(screen.getByRole('tab', { name: /Retro Games/ }))
    expect(screen.getByText('retro-section')).toBeTruthy()
  })
})
