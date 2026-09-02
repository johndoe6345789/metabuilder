import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { AdvancedClassInput } from './AdvancedClassInput'

describe('AdvancedClassInput', () => {
  it('hides the text field when closed', () => {
    render(
      <AdvancedClassInput
        value="card"
        open={false}
        onToggleOpen={vi.fn()}
        onChange={vi.fn()}
      />
    )
    expect(screen.queryByLabelText('CSS classes')).toBeNull()
  })

  it('shows the text field with the current value when open', () => {
    render(
      <AdvancedClassInput
        value="card legacy-util"
        open
        onToggleOpen={vi.fn()}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByLabelText('CSS classes')).toHaveProperty(
      'value',
      'card legacy-util'
    )
  })

  it('calls onToggleOpen when the disclosure header is clicked', () => {
    const onToggleOpen = vi.fn()
    render(
      <AdvancedClassInput
        value=""
        open={false}
        onToggleOpen={onToggleOpen}
        onChange={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('Type a class name instead'))
    expect(onToggleOpen).toHaveBeenCalledOnce()
  })

  it('forwards a typed change verbatim', () => {
    const onChange = vi.fn()
    render(
      <AdvancedClassInput
        value=""
        open
        onToggleOpen={vi.fn()}
        onChange={onChange}
      />
    )
    fireEvent.change(screen.getByLabelText('CSS classes'), {
      target: { value: 'legacy-util' },
    })
    expect(onChange).toHaveBeenCalledWith('legacy-util')
  })
})
