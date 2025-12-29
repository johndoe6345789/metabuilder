import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TextArea } from './TextArea'

describe('TextArea', () => {
  it.each([
    { placeholder: 'Enter text', fullWidth: true },
    { placeholder: 'Comment here', fullWidth: false },
    { placeholder: 'Description', minRows: 5 },
  ])('renders with props %o', props => {
    render(<TextArea {...props} />)
    const textarea = screen.getByPlaceholderText(props.placeholder)
    expect(textarea).not.toBeNull()
  })

  it('shows error state', () => {
    render(<TextArea error placeholder="Enter text" />)
    const textarea = screen.getByPlaceholderText('Enter text')
    expect(textarea).not.toBeNull()
  })

  it('accepts placeholder prop', () => {
    const placeholder = 'Type here'
    render(<TextArea placeholder={placeholder} />)
    const textarea = screen.getByPlaceholderText(placeholder) as HTMLTextAreaElement
    expect(textarea.placeholder).toBe(placeholder)
  })
})
