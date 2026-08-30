import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { ColorControl } from './ColorControl'
import type { StyleControl } from '../style-controls'

const control: Extract<StyleControl, { kind: 'color' }> = {
  kind: 'color',
  prop: 'color',
  label: 'Text colour',
}

describe('ColorControl', () => {
  it('sets a theme colour when a swatch is clicked', () => {
    const onSet = vi.fn()
    render(
      <ColorControl
        control={control}
        value={undefined}
        header={null}
        hint={null}
        onSet={onSet}
      />
    )
    fireEvent.click(screen.getByLabelText('Brand'))
    expect(onSet).toHaveBeenCalledWith('color', 'var(--mat-sys-primary)')
  })

  it('opens the custom picker and forwards its hex value', () => {
    const onSet = vi.fn()
    const { container } = render(
      <ColorControl
        control={control}
        value={undefined}
        header={null}
        hint={null}
        onSet={onSet}
      />
    )
    fireEvent.click(screen.getByText('Custom…'))
    const input = container.querySelector('input[type="color"]')
    expect(input).not.toBeNull()
    if (input === null) throw new Error('missing color input')
    fireEvent.change(input, { target: { value: '#ff00ff' } })
    expect(onSet).toHaveBeenCalledWith('color', '#ff00ff')
  })

  it('opens the custom picker already when the value is a custom hex', () => {
    render(
      <ColorControl
        control={control}
        value="#123456"
        header={null}
        hint={null}
        onSet={vi.fn()}
      />
    )
    expect(screen.getAllByDisplayValue('#123456')).toHaveLength(2)
  })

  it('closes the custom picker on a second click', () => {
    render(
      <ColorControl
        control={control}
        value={undefined}
        header={null}
        hint={null}
        onSet={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('Custom…'))
    fireEvent.click(screen.getByText('Custom…'))
    expect(screen.queryByDisplayValue('#000000')).toBeNull()
  })
})
