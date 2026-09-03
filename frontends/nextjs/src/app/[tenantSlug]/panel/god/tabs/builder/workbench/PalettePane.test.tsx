import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { PalettePane } from './PalettePane'

const noop = { onSelectType: vi.fn(), onRequestAdd: vi.fn() }

describe('PalettePane', () => {
  it('shows every category when nothing is typed', () => {
    render(<PalettePane pendingType={null} {...noop} />)
    expect(screen.getByText('Layout')).toBeTruthy()
    expect(screen.getByText('Grid')).toBeTruthy()
  })

  it('narrows to matching blocks across all categories when typing', () => {
    render(<PalettePane pendingType={null} {...noop} />)
    fireEvent.change(screen.getByPlaceholderText('Find a block…'), {
      target: { value: 'grid' },
    })
    expect(screen.getByText('Grid')).toBeTruthy()
    expect(screen.queryByText('Layout')).toBeNull()
    expect(screen.queryByText('Paragraph')).toBeNull()
  })

  it('says so when nothing matches', () => {
    render(<PalettePane pendingType={null} {...noop} />)
    fireEvent.change(screen.getByPlaceholderText('Find a block…'), {
      target: { value: 'zzzznotablock' },
    })
    expect(screen.getByText(/No block matches/)).toBeTruthy()
  })

  it('stages the block that was clicked, rather than adding it', () => {
    const onSelectType = vi.fn()
    render(
      <PalettePane
        pendingType={null}
        onSelectType={onSelectType}
        onRequestAdd={vi.fn()}
      />
    )
    fireEvent.change(screen.getByPlaceholderText('Find a block…'), {
      target: { value: 'grid' },
    })
    fireEvent.click(screen.getByText('Grid'))
    expect(onSelectType).toHaveBeenCalledWith('grid')
  })

  it('shows no Add button while nothing is staged', () => {
    render(<PalettePane pendingType={null} {...noop} />)
    expect(screen.queryByRole('button', { name: /^Add /i })).toBeNull()
  })

  it('shows an Add button naming the staged block once one is picked', () => {
    render(<PalettePane pendingType="grid" {...noop} />)
    expect(screen.getByRole('button', { name: 'Add Grid' })).toBeTruthy()
  })

  it('asks the parent to open the placement dialog when Add is clicked', () => {
    const onRequestAdd = vi.fn()
    render(
      <PalettePane pendingType="grid" onSelectType={vi.fn()} onRequestAdd={onRequestAdd} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add Grid' }))
    expect(onRequestAdd).toHaveBeenCalled()
  })
})
