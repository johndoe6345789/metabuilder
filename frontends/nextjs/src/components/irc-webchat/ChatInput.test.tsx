import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ChatInput } from './ChatInput'

const props = () => ({
  onSend: vi.fn(),
  onSystemMessage: vi.fn(),
  onClear: vi.fn(),
  username: 'alex',
  memberCount: 3,
})

const input = () =>
  screen.getByPlaceholderText('Type a message... (/help for commands)')

describe('ChatInput', () => {
  it('disables Send while the field is empty', () => {
    render(<ChatInput {...props()} />)
    expect(
      (screen.getByLabelText('Send message') as HTMLButtonElement).disabled
    ).toBe(true)
  })

  it('enables Send once there is text', () => {
    render(<ChatInput {...props()} />)
    fireEvent.change(input(), { target: { value: 'hi' } })
    expect(
      (screen.getByLabelText('Send message') as HTMLButtonElement).disabled
    ).toBe(false)
  })

  it('sends a plain message and clears the field', () => {
    const p = props()
    render(<ChatInput {...p} />)
    fireEvent.change(input(), { target: { value: 'hello' } })
    fireEvent.click(screen.getByLabelText('Send message'))
    expect(p.onSend).toHaveBeenCalledWith('hello')
    expect((input() as HTMLInputElement).value).toBe('')
  })

  it('sends on Enter, not on Shift+Enter', () => {
    const p = props()
    render(<ChatInput {...p} />)
    fireEvent.change(input(), { target: { value: 'hi' } })
    fireEvent.keyDown(input(), { key: 'Enter', shiftKey: true })
    expect(p.onSend).not.toHaveBeenCalled()

    fireEvent.keyDown(input(), { key: 'Enter' })
    expect(p.onSend).toHaveBeenCalledWith('hi')
  })

  it('routes a slash command through handleCommand instead of onSend', () => {
    const p = props()
    render(<ChatInput {...p} />)
    fireEvent.change(input(), { target: { value: '/clear' } })
    fireEvent.click(screen.getByLabelText('Send message'))
    expect(p.onClear).toHaveBeenCalledOnce()
    expect(p.onSend).not.toHaveBeenCalled()
  })

  it('does nothing for a blank or whitespace-only message', () => {
    const p = props()
    render(<ChatInput {...p} />)
    fireEvent.change(input(), { target: { value: '   ' } })
    fireEvent.click(screen.getByLabelText('Send message'))
    expect(p.onSend).not.toHaveBeenCalled()
  })
})
