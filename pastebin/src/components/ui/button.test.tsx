import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { Button } from './button'

describe('Button Component', () => {
  it('renders button with default props', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('applies filled variant class', () => {
    render(<Button variant="filled">Filled Button</Button>)
    const button = screen.getByRole('button', { name: /filled button/i })
    expect(button).toHaveClass('mat-mdc-unelevated-button')
  })

  it('applies outlined variant class', () => {
    render(<Button variant="outlined">Outlined Button</Button>)
    const button = screen.getByRole('button', { name: /outlined button/i })
    expect(button).toHaveClass('mat-mdc-outlined-button')
  })

  it('applies text variant class', () => {
    render(<Button variant="text">Text Button</Button>)
    const button = screen.getByRole('button', { name: /text button/i })
    expect(button).toHaveClass('mat-mdc-button')
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders disabled state', () => {
    render(<Button disabled>Disabled Button</Button>)
    const button = screen.getByRole('button', { name: /disabled button/i })
    expect(button).toBeDisabled()
  })

  it('renders children correctly', () => {
    render(
      <Button>
        <span data-testid="child">Child Element</span>
      </Button>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('passes through custom className', () => {
    render(<Button className="custom-class">Styled Button</Button>)
    const button = screen.getByRole('button', { name: /styled button/i })
    expect(button).toHaveClass('custom-class')
  })
})
