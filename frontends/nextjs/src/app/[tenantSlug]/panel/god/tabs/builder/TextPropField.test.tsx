import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { TextPropField } from './TextPropField'
import type { PropField } from '@/components/blocks/block-props'

const field: PropField = {
  name: 'alt',
  label: 'Description',
  type: 'text',
  hint: 'Read aloud to people who cannot see the image.',
}

describe('TextPropField', () => {
  it('shows the hint when there is no warning', () => {
    render(<TextPropField field={field} current="" onChange={vi.fn()} />)
    expect(
      screen.getByText('Read aloud to people who cannot see the image.')
    ).toBeTruthy()
  })

  it('shows the warning instead of the hint, and marks the field invalid', () => {
    render(
      <TextPropField
        field={field}
        current=""
        warning="This image has no description."
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText('This image has no description.')).toBeTruthy()
    expect(screen.queryByText(field.hint as string)).toBeNull()
    expect(screen.getByLabelText('Description')).toHaveProperty(
      'ariaInvalid',
      'true'
    )
  })

  it('forwards a typed change', () => {
    const onChange = vi.fn()
    render(<TextPropField field={field} current="" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'A red bicycle' },
    })
    expect(onChange).toHaveBeenCalledWith({ alt: 'A red bicycle' })
  })
})
