import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { StyleControlField } from './StyleControlField'
import { colorFixture, sizeFixture } from './controls/test-fixtures'

describe('size control', () => {
  it('shows a Clear button once a value is set', () => {
    render(
      <StyleControlField
        control={sizeFixture}
        value="16px"
        onSet={vi.fn()}
        onClear={vi.fn()}
      />
    )
    expect(screen.getByText('Clear')).toBeTruthy()
  })

  it('shows no Clear button with no value set', () => {
    render(
      <StyleControlField
        control={sizeFixture}
        value={undefined}
        onSet={vi.fn()}
        onClear={vi.fn()}
      />
    )
    expect(screen.queryByText('Clear')).toBeNull()
  })

  it('clears the declaration on click', () => {
    const onClear = vi.fn()
    render(
      <StyleControlField
        control={sizeFixture}
        value="16px"
        onSet={vi.fn()}
        onClear={onClear}
      />
    )
    fireEvent.click(screen.getByText('Clear'))
    expect(onClear).toHaveBeenCalledWith('font-size')
  })
})

describe('color control', () => {
  it('sets a theme colour on click', () => {
    const onSet = vi.fn()
    render(
      <StyleControlField
        control={colorFixture}
        value={undefined}
        onSet={onSet}
        onClear={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('Custom…'))
    expect(screen.getByText('Text colour')).toBeTruthy()
  })
})

describe('hint', () => {
  it('shows the hint text when the control declares one', () => {
    render(
      <StyleControlField
        control={{ ...sizeFixture, hint: 'Line height scales with this' }}
        value={undefined}
        onSet={vi.fn()}
        onClear={vi.fn()}
      />
    )
    expect(screen.getByText('Line height scales with this')).toBeTruthy()
  })
})
