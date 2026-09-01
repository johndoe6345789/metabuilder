import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PRODUCT_TIERS } from '@/lib/packages/product-packages'
import { TierPicker } from './TierPicker'

describe('TierPicker', () => {
  it('renders every tier by name', () => {
    render(<TierPicker tier="starter" onChange={vi.fn()} />)
    for (const t of PRODUCT_TIERS) {
      expect(screen.getByText(t.name)).toBeTruthy()
    }
  })

  it('shows a "Popular" badge only on the highlighted tier', () => {
    render(<TierPicker tier="starter" onChange={vi.fn()} />)
    const highlighted = PRODUCT_TIERS.filter(t => t.highlight)
    expect(screen.getAllByText('Popular')).toHaveLength(highlighted.length)
  })

  it('calls onChange with the clicked tier id', () => {
    const onChange = vi.fn()
    render(<TierPicker tier="starter" onChange={onChange} />)
    const creator = PRODUCT_TIERS.find(t => t.id === 'creator')
    if (creator === undefined) throw new Error('fixture missing "creator"')

    screen.getByText(creator.name).closest('button')?.click()

    expect(onChange).toHaveBeenCalledWith('creator')
  })

  it('marks the currently-selected tier button', () => {
    const selected = PRODUCT_TIERS[0]
    render(<TierPicker tier={selected.id} onChange={vi.fn()} />)
    const button = screen.getByText(selected.name).closest('button')
    expect(button?.className).toContain('tierSelected')
  })
})
