import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { PaletteItemButton } from './PaletteItemButton'
import { PALETTE_MIME } from '../ComponentTreeOutline'

const item = {
  type: 'html.h1',
  name: 'Heading 1',
  icon: 'format_h1',
  category: 'HTML' as const,
  container: false,
  defaults: {},
}

const renderButton = (selected: boolean, onSelect = vi.fn()) =>
  render(
    <PaletteItemButton item={item} selected={selected} onSelect={onSelect} />
  )

describe('PaletteItemButton', () => {
  it('shows the block name', () => {
    renderButton(false)
    expect(screen.getByText('Heading 1')).toBeTruthy()
  })

  it('selects the block on click, rather than adding it', () => {
    const onSelect = vi.fn()
    renderButton(false, onSelect)
    fireEvent.click(screen.getByText('Heading 1'))
    expect(onSelect).toHaveBeenCalledWith('html.h1')
  })

  it('marks itself pressed when selected', () => {
    renderButton(true)
    const pressed = screen.getByRole('button').getAttribute('aria-pressed')
    expect(pressed).toBe('true')
  })

  it('is not pressed when not selected', () => {
    renderButton(false)
    const pressed = screen.getByRole('button').getAttribute('aria-pressed')
    expect(pressed).toBe('false')
  })

  it('is draggable, carrying its type for a drop onto the tree', () => {
    renderButton(false)
    const button = screen.getByRole('button')
    expect(button.getAttribute('draggable')).toBe('true')
    const setData = vi.fn()
    const dataTransfer = { setData, effectAllowed: '' }
    fireEvent.dragStart(button, { dataTransfer })
    expect(setData).toHaveBeenCalledWith(PALETTE_MIME, 'html.h1')
  })
})
