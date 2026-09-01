import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GodPanelTopBar } from './GodPanelTopBar'

const props = () => ({
  guideOpen: false,
  nerdOpen: false,
  onHome: vi.fn(),
  onPreview: vi.fn(),
  onToggleGuide: vi.fn(),
  onToggleNerd: vi.fn(),
})

describe('GodPanelTopBar', () => {
  it('calls onHome when the home button is clicked', () => {
    const p = props()
    render(<GodPanelTopBar {...p} />)
    screen.getByText('⌂ Home').click()
    expect(p.onHome).toHaveBeenCalledOnce()
  })

  it('calls onPreview with the right level for each preview button', () => {
    const p = props()
    render(<GodPanelTopBar {...p} />)
    screen.getByText('L1').click()
    screen.getByText('L2').click()
    screen.getByText('L3').click()
    expect(p.onPreview).toHaveBeenNthCalledWith(1, 1)
    expect(p.onPreview).toHaveBeenNthCalledWith(2, 2)
    expect(p.onPreview).toHaveBeenNthCalledWith(3, 3)
  })

  it('calls onToggleGuide/onToggleNerd on their buttons', () => {
    const p = props()
    render(<GodPanelTopBar {...p} />)
    screen.getByText('Walk Me').click()
    screen.getByText('⚡ Nerd Mode').click()
    expect(p.onToggleGuide).toHaveBeenCalledOnce()
    expect(p.onToggleNerd).toHaveBeenCalledOnce()
  })

  it('reflects guideOpen/nerdOpen as the "contained" button variant', () => {
    render(<GodPanelTopBar {...props()} guideOpen nerdOpen />)
    const guide = screen.getByText('Walk Me')
    const nerd = screen.getByText('⚡ Nerd Mode')
    expect(guide.closest('button')?.className).toContain('unelevated')
    expect(nerd.closest('button')?.className).toContain('unelevated')
  })
})
