import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { NumberField } from './NumberField'

describe('NumberField', () => {
  it.each([
    { label: 'Number', value: undefined },
    { label: 'Age', value: 25 },
    { label: 'Quantity', value: 100 },
  ])('renders with label "$label" and value $value', ({ label, value }) => {
    render(<NumberField label={label} value={value} />)

    expect(screen.getByLabelText(label)).toBeTruthy()
    if (value !== undefined) {
      expect(screen.getByDisplayValue(value.toString())).toBeTruthy()
    }
  })

  it.each([
    { min: 0, max: 100, step: 1 },
    { min: -10, max: 10, step: 0.5 },
    { min: undefined, max: undefined, step: undefined },
  ])('respects min $min, max $max, step $step constraints', ({ min, max, step }) => {
    render(<NumberField min={min} max={max} step={step} />)

    const input = screen.getByLabelText('Number') as HTMLInputElement

    if (min !== undefined) {
      expect(input.min).toBe(min.toString())
    }
    if (max !== undefined) {
      expect(input.max).toBe(max.toString())
    }
    if (step !== undefined) {
      expect(input.step).toBe(step.toString())
    } else {
      expect(input.step).toBe('1')
    }
  })

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn()
    render(<NumberField onChange={handleChange} />)

    const input = screen.getByLabelText('Number')
    fireEvent.change(input, { target: { value: '42' } })

    expect(handleChange).toHaveBeenCalled()
  })

  it.each([
    { error: 'Value too high', helperText: undefined },
    { error: undefined, helperText: 'Enter a number between 0 and 100' },
  ])('displays error "$error" or helperText "$helperText"', ({ error, helperText }) => {
    render(<NumberField error={error} helperText={helperText} />)

    const displayText = error || helperText
    if (displayText) {
      expect(screen.getByText(displayText)).toBeTruthy()
    }
  })

  it('has type="number" attribute', () => {
    render(<NumberField />)

    const input = screen.getByLabelText('Number') as HTMLInputElement
    expect(input.type).toBe('number')
  })
})
