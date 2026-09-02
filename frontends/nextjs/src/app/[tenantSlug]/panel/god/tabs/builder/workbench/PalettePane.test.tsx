import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { PalettePane } from './PalettePane'

describe('PalettePane', () => {
  it('shows every category when nothing is typed', () => {
    render(<PalettePane onAdd={vi.fn()} />)
    expect(screen.getByText('Layout')).toBeTruthy()
    expect(screen.getByText('Grid')).toBeTruthy()
  })

  it('narrows to matching blocks across all categories when typing', () => {
    render(<PalettePane onAdd={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('Find a block…'), {
      target: { value: 'grid' },
    })
    expect(screen.getByText('Grid')).toBeTruthy()
    expect(screen.queryByText('Layout')).toBeNull()
    expect(screen.queryByText('Paragraph')).toBeNull()
  })

  it('says so when nothing matches', () => {
    render(<PalettePane onAdd={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('Find a block…'), {
      target: { value: 'zzzznotablock' },
    })
    expect(screen.getByText(/No block matches/)).toBeTruthy()
  })

  it('adds the block that was clicked, found by typing', () => {
    const onAdd = vi.fn()
    render(<PalettePane onAdd={onAdd} />)
    fireEvent.change(screen.getByPlaceholderText('Find a block…'), {
      target: { value: 'grid' },
    })
    fireEvent.click(screen.getByText('Grid'))
    expect(onAdd).toHaveBeenCalledWith('grid')
  })
})
