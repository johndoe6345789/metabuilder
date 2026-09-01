import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

vi.mock('@/components/layout/LevelGate', () => ({
  LevelGate: ({
    minLevel,
    levelName,
    children,
  }: {
    minLevel: number
    levelName?: string
    children: React.ReactNode
  }) => (
    <div data-testid="gate" data-level={minLevel} data-name={levelName}>
      {children}
    </div>
  ),
}))
vi.mock('@/components/media/RetroLauncher', () => ({
  RetroLauncher: () => <div>retro-launcher</div>,
}))
vi.mock('./VideoDemo', () => ({
  VideoDemo: () => <div>video-demo</div>,
}))
vi.mock('./AudioDemo', () => ({
  AudioDemo: () => <div>audio-demo</div>,
}))

import MediaCenterPage from './page'

describe('MediaCenterPage', () => {
  it('gates for User level 2', () => {
    render(<MediaCenterPage />)
    const gate = screen.getByTestId('gate')
    expect(gate.getAttribute('data-level')).toBe('2')
    expect(gate.getAttribute('data-name')).toBe('User')
  })

  it('shows the video demo by default', () => {
    render(<MediaCenterPage />)
    expect(screen.getByText('video-demo')).toBeTruthy()
  })

  it('switches to the audio demo when its tab is clicked', () => {
    render(<MediaCenterPage />)
    fireEvent.click(screen.getByRole('tab', { name: 'Audio' }))
    expect(screen.getByText('audio-demo')).toBeTruthy()
  })

  it('switches to retro gaming when its tab is clicked', () => {
    render(<MediaCenterPage />)
    fireEvent.click(screen.getByRole('tab', { name: 'Retro Gaming' }))
    expect(screen.getByText('retro-launcher')).toBeTruthy()
  })
})
