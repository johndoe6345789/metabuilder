import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { StyleControlField } from './StyleControlField'
import { choiceFixture, toggleFixture } from './controls/test-fixtures'

describe('choice control', () => {
  it('sets the picked option', () => {
    const onSet = vi.fn()
    render(
      <StyleControlField
        control={choiceFixture}
        value={undefined}
        onSet={onSet}
        onClear={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('Right'))
    expect(onSet).toHaveBeenCalledWith('text-align', 'right')
  })

  it('clears when the active option is picked again', () => {
    const onClear = vi.fn()
    render(
      <StyleControlField
        control={choiceFixture}
        value="right"
        onSet={vi.fn()}
        onClear={onClear}
      />
    )
    fireEvent.click(screen.getByText('Right'))
    expect(onClear).toHaveBeenCalledWith('text-align')
  })
})

describe('toggle control', () => {
  it('sets the "on" value when checked', () => {
    const onSet = vi.fn()
    render(
      <StyleControlField
        control={toggleFixture}
        value={undefined}
        onSet={onSet}
        onClear={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onSet).toHaveBeenCalledWith('font-style', 'italic')
  })

  it('clears when unchecked', () => {
    const onClear = vi.fn()
    render(
      <StyleControlField
        control={toggleFixture}
        value="italic"
        onSet={vi.fn()}
        onClear={onClear}
      />
    )
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onClear).toHaveBeenCalledWith('font-style')
  })
})
