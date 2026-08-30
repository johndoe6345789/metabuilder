import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { ControlHeader } from './ControlHeader'

describe('ControlHeader', () => {
  it('shows only the label when nothing is set', () => {
    render(
      <ControlHeader label="Size" isSet={false} onClear={vi.fn()} />
    )
    expect(screen.getByText('Size')).toBeTruthy()
    expect(screen.queryByText('Clear')).toBeNull()
  })

  it('shows the current value and a Clear button when set', () => {
    render(
      <ControlHeader
        label="Size"
        isSet
        currentValue="16px"
        onClear={vi.fn()}
      />
    )
    expect(screen.getByText('16px')).toBeTruthy()
    expect(screen.getByText('Clear')).toBeTruthy()
  })

  it('hides the value badge when set but no value is given', () => {
    render(<ControlHeader label="Size" isSet onClear={vi.fn()} />)
    expect(screen.getByText('Clear')).toBeTruthy()
  })

  it('calls onClear when Clear is clicked', () => {
    const onClear = vi.fn()
    render(
      <ControlHeader
        label="Size"
        isSet
        currentValue="16px"
        onClear={onClear}
      />
    )
    fireEvent.click(screen.getByText('Clear'))
    expect(onClear).toHaveBeenCalledOnce()
  })
})
