import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/components/media/stream/LiveTvSection', () => ({
  LiveTvSection: () => <div>tv-section</div>,
}))
vi.mock('@/components/media/stream/RadioSection', () => ({
  RadioSection: () => <div>radio-section</div>,
}))
vi.mock('@/components/media/RetroLauncher', () => ({
  RetroLauncher: () => <div>retro-section</div>,
}))

import { PanelStage } from './PanelStage'

describe('PanelStage', () => {
  it('shows live TV when active is tv', () => {
    render(<PanelStage active="tv" watchTrigger={null} />)
    expect(screen.getByText('tv-section')).toBeTruthy()
  })

  it('shows radio when active is radio', () => {
    render(<PanelStage active="radio" watchTrigger={null} />)
    expect(screen.getByText('radio-section')).toBeTruthy()
  })

  it('shows retro when active is retro', () => {
    render(<PanelStage active="retro" watchTrigger={null} />)
    expect(screen.getByText('retro-section')).toBeTruthy()
  })
})
