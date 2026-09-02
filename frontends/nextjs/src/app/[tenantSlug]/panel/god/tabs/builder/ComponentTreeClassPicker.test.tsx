import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

const hydrate = vi.fn()
const cssMod = vi.hoisted(() => ({ useCssClasses: vi.fn() }))
vi.mock('../styles/use-css-classes', () => cssMod)

import { ComponentTreeClassPicker } from './ComponentTreeClassPicker'

const setup = (classes: { id: string; name: string; props: object }[]) => {
  cssMod.useCssClasses.mockReturnValue({ classes, hydrate })
}

describe('ComponentTreeClassPicker', () => {
  it('applies a class by clicking its chip, not by typing', () => {
    setup([{ id: 'c1', name: 'card', props: {} }])
    const onChange = vi.fn()
    render(
      <ComponentTreeClassPicker value="" tenant="acme" onChange={onChange} />
    )
    fireEvent.click(screen.getByText('card'))
    expect(onChange).toHaveBeenCalledWith('card')
  })

  it('keeps the free-text escape hatch collapsed by default', () => {
    setup([{ id: 'c1', name: 'card', props: {} }])
    render(<ComponentTreeClassPicker value="card" tenant="acme" onChange={vi.fn()} />)
    expect(screen.queryByLabelText('CSS classes')).toBeNull()
  })

  it('auto-opens the escape hatch when an applied class is unrecognised', () => {
    setup([{ id: 'c1', name: 'card', props: {} }])
    render(
      <ComponentTreeClassPicker
        value="legacy-util"
        tenant="acme"
        onChange={vi.fn()}
      />
    )
    expect(screen.getByLabelText('CSS classes')).toBeTruthy()
  })

  it('points the Styles link at "Define" when nothing is defined yet', () => {
    setup([])
    render(<ComponentTreeClassPicker value="" tenant="acme" onChange={vi.fn()} />)
    expect(screen.getByText('Define classes in Styles')).toBeTruthy()
  })

  it('hydrates classes for the current tenant on mount', () => {
    setup([])
    render(<ComponentTreeClassPicker value="" tenant="acme" onChange={vi.fn()} />)
    expect(hydrate).toHaveBeenCalledWith('acme')
  })
})
