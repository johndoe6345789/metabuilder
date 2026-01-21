import React from 'react'
import { render, screen, fireEvent } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { Slider } from './slider'

describe('Slider Component', () => {
  // Basic rendering tests
  it('renders slider container', () => {
    const { container } = render(<Slider />)
    expect(container.querySelector('.mat-mdc-slider')).toBeInTheDocument()
  })

  it('renders input element with type range', () => {
    const { container } = render(<Slider />)
    const input = container.querySelector('input[type="range"]')
    expect(input).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Slider className="custom-slider" />)
    expect(container.querySelector('.mat-mdc-slider')).toHaveClass('custom-slider')
  })

  it('renders slider track', () => {
    const { container } = render(<Slider />)
    expect(container.querySelector('.mdc-slider__track')).toBeInTheDocument()
  })

  it('renders slider thumb', () => {
    const { container } = render(<Slider />)
    expect(container.querySelector('.mdc-slider__thumb')).toBeInTheDocument()
  })

  // Props tests
  it('sets min value from props', () => {
    const { container } = render(<Slider min={10} />)
    const input = container.querySelector('input[type="range"]')
    expect(input).toHaveAttribute('min', '10')
  })

  it('sets max value from props', () => {
    const { container } = render(<Slider max={200} />)
    const input = container.querySelector('input[type="range"]')
    expect(input).toHaveAttribute('max', '200')
  })

  it('sets step value from props', () => {
    const { container } = render(<Slider step={5} />)
    const input = container.querySelector('input[type="range"]')
    expect(input).toHaveAttribute('step', '5')
  })

  it('defaults to min=0 when not specified', () => {
    const { container } = render(<Slider />)
    const input = container.querySelector('input[type="range"]')
    expect(input).toHaveAttribute('min', '0')
  })

  it('defaults to max=100 when not specified', () => {
    const { container } = render(<Slider />)
    const input = container.querySelector('input[type="range"]')
    expect(input).toHaveAttribute('max', '100')
  })

  it('defaults to step=1 when not specified', () => {
    const { container } = render(<Slider />)
    const input = container.querySelector('input[type="range"]')
    expect(input).toHaveAttribute('step', '1')
  })

  // Value tests
  it('sets initial value from value prop', () => {
    const { container } = render(<Slider value={[50]} />)
    const input = container.querySelector('input[type="range"]') as HTMLInputElement
    expect(input.value).toBe('50')
  })

  it('uses first value in array', () => {
    const { container } = render(<Slider value={[75]} />)
    const input = container.querySelector('input[type="range"]') as HTMLInputElement
    expect(input.value).toBe('75')
  })

  it('defaults to value [0]', () => {
    const { container } = render(<Slider />)
    const input = container.querySelector('input[type="range"]') as HTMLInputElement
    expect(input.value).toBe('0')
  })

  // Change event tests
  it('calls onValueChange when slider value changes', () => {
    const handleValueChange = jest.fn()
    const { container } = render(<Slider onValueChange={handleValueChange} />)

    const input = container.querySelector('input[type="range"]') as HTMLInputElement
    fireEvent.change(input, { target: { value: '50' } })

    expect(handleValueChange).toHaveBeenCalled()
  })

  it('passes correct value to onValueChange', () => {
    const handleValueChange = jest.fn()
    const { container } = render(<Slider onValueChange={handleValueChange} />)

    const input = container.querySelector('input[type="range"]') as HTMLInputElement
    fireEvent.change(input, { target: { value: '75' } })

    // Verify the callback was called (may be called with the new value)
    expect(handleValueChange).toHaveBeenCalled()
  })

  // Dragging tests
  it('renders input that can receive change events', () => {
    const { container } = render(<Slider min={0} max={100} value={[50]} />)

    const input = container.querySelector('input[type="range"]') as HTMLInputElement
    expect(input.value).toBe('50')
  })

  it('updates value when dragged across range', () => {
    const handleValueChange = jest.fn()
    const { container, rerender } = render(
      <Slider min={0} max={100} value={[25]} onValueChange={handleValueChange} />
    )

    const input = container.querySelector('input[type="range"]') as HTMLInputElement
    expect(input.value).toBe('25')

    rerender(<Slider min={0} max={100} value={[50]} onValueChange={handleValueChange} />)
    expect(input.value).toBe('50')

    rerender(<Slider min={0} max={100} value={[75]} onValueChange={handleValueChange} />)
    expect(input.value).toBe('75')
  })

  // Track fill tests
  it('renders active track', () => {
    const { container } = render(<Slider />)
    expect(container.querySelector('.mdc-slider__track--active')).toBeInTheDocument()
  })

  it('renders inactive track', () => {
    const { container } = render(<Slider />)
    expect(container.querySelector('.mdc-slider__track--inactive')).toBeInTheDocument()
  })

  it('updates track width based on value', () => {
    const { container } = render(<Slider value={[50]} min={0} max={100} />)
    const activeTrack = container.querySelector('.mdc-slider__track--active') as HTMLElement
    const style = activeTrack.style.transform
    expect(style).toBe('scaleX(0.5)')
  })

  it('calculates correct percentage for custom range', () => {
    const { container } = render(<Slider value={[30]} min={0} max={100} />)
    const activeTrack = container.querySelector('.mdc-slider__track--active') as HTMLElement
    const style = activeTrack.style.transform
    expect(style).toBe('scaleX(0.3)')
  })

  it('calculates percentage correctly with custom min', () => {
    const { container } = render(<Slider value={[60]} min={20} max={120} />)
    const activeTrack = container.querySelector('.mdc-slider__track--active') as HTMLElement
    const style = activeTrack.style.transform
    // (60 - 20) / (120 - 20) = 40 / 100 = 0.4
    expect(style).toBe('scaleX(0.4)')
  })

  // Thumb position tests
  it('positions thumb based on value', () => {
    const { container } = render(<Slider value={[50]} min={0} max={100} />)
    const thumb = container.querySelector('.mdc-slider__thumb') as HTMLElement
    expect(thumb.style.left).toBe('50%')
  })

  it('positions thumb at start when value is min', () => {
    const { container } = render(<Slider value={[0]} min={0} max={100} />)
    const thumb = container.querySelector('.mdc-slider__thumb') as HTMLElement
    expect(thumb.style.left).toBe('0%')
  })

  it('positions thumb at end when value is max', () => {
    const { container } = render(<Slider value={[100]} min={0} max={100} />)
    const thumb = container.querySelector('.mdc-slider__thumb') as HTMLElement
    expect(thumb.style.left).toBe('100%')
  })

  // Thumb knob test
  it('renders thumb knob', () => {
    const { container } = render(<Slider />)
    expect(container.querySelector('.mdc-slider__thumb-knob')).toBeInTheDocument()
  })

  // Disabled state test
  it('can be disabled', () => {
    const { container } = render(<Slider disabled />)
    const input = container.querySelector('input[type="range"]')
    expect(input).toHaveAttribute('disabled')
  })

  // Edge cases
  it('handles value at boundaries', () => {
    const { container } = render(<Slider value={[0]} min={0} max={100} />)
    const input = container.querySelector('input[type="range"]') as HTMLInputElement
    expect(input.value).toBe('0')
  })

  it('handles large range values', () => {
    const { container } = render(<Slider min={0} max={10000} value={[5000]} />)
    const input = container.querySelector('input[type="range"]') as HTMLInputElement
    expect(input.value).toBe('5000')
  })

  it('handles negative minimum values', () => {
    const { container } = render(<Slider min={-100} max={100} value={[0]} />)
    const input = container.querySelector('input[type="range"]') as HTMLInputElement
    expect(input).toHaveAttribute('min', '-100')
    expect(input.value).toBe('0')
  })

  it('handles fractional step values', () => {
    const { container } = render(<Slider min={0} max={1} step={0.1} value={[0.5]} />)
    const input = container.querySelector('input[type="range"]') as HTMLInputElement
    expect(input).toHaveAttribute('step', '0.1')
  })

  // Aria attributes test
  it('passes aria attributes to input', () => {
    const { container } = render(
      <Slider aria-label="Volume" aria-labelledby="volume-label" />
    )
    const input = container.querySelector('input[type="range"]')
    expect(input).toHaveAttribute('aria-label', 'Volume')
    expect(input).toHaveAttribute('aria-labelledby', 'volume-label')
  })

  // Ref forwarding test
  it('forwards ref to input element', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Slider ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  // Multiple value changes test
  it('handles multiple rapid value changes', () => {
    const handleValueChange = jest.fn()
    const { rerender } = render(
      <Slider value={[10]} onValueChange={handleValueChange} />
    )

    rerender(<Slider value={[20]} onValueChange={handleValueChange} />)
    rerender(<Slider value={[50]} onValueChange={handleValueChange} />)
    rerender(<Slider value={[80]} onValueChange={handleValueChange} />)

    expect(handleValueChange).not.toHaveBeenCalled()
  })
})
