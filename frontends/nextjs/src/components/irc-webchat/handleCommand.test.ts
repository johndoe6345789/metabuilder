import { describe, expect, it, vi } from 'vitest'
import { handleCommand } from './handleCommand'

describe('handleCommand', () => {
  it('leaves plain messages unhandled', () => {
    const onSystem = vi.fn()
    const onClear = vi.fn()
    const handled = handleCommand('hello there', 'alex', 3, onSystem, onClear)
    expect(handled).toBe(false)
    expect(onSystem).not.toHaveBeenCalled()
  })

  it('/help posts the help text as a system message', () => {
    const onSystem = vi.fn()
    const handled = handleCommand('/help', 'alex', 3, onSystem, vi.fn())
    expect(handled).toBe(true)
    expect(onSystem).toHaveBeenCalledWith(
      expect.objectContaining({
        createdBy: 'System',
        type: 'system',
        content: expect.stringContaining('Commands:'),
      })
    )
  })

  it('/clear calls onClear instead of posting a message', () => {
    const onSystem = vi.fn()
    const onClear = vi.fn()
    const handled = handleCommand('/clear', 'alex', 3, onSystem, onClear)
    expect(handled).toBe(true)
    expect(onClear).toHaveBeenCalledOnce()
    expect(onSystem).not.toHaveBeenCalled()
  })

  it('/users reports the member count', () => {
    const onSystem = vi.fn()
    handleCommand('/users', 'alex', 7, onSystem, vi.fn())
    expect(onSystem).toHaveBeenCalledWith(
      expect.objectContaining({ content: 'Members: 7' })
    )
  })

  it('/me posts an action attributed to the sender', () => {
    const onSystem = vi.fn()
    handleCommand('/me waves hello', 'alex', 3, onSystem, vi.fn())
    expect(onSystem).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'waves hello',
        createdBy: 'alex',
        type: 'me',
      })
    )
  })

  it('/me with no action posts nothing but is still handled', () => {
    const onSystem = vi.fn()
    const handled = handleCommand('/me', 'alex', 3, onSystem, vi.fn())
    expect(handled).toBe(true)
    expect(onSystem).not.toHaveBeenCalled()
  })

  it('/me with only whitespace posts nothing', () => {
    const onSystem = vi.fn()
    handleCommand('/me    ', 'alex', 3, onSystem, vi.fn())
    expect(onSystem).not.toHaveBeenCalled()
  })

  it('an unknown command gets a helpful system reply', () => {
    const onSystem = vi.fn()
    const handled = handleCommand('/nope', 'alex', 3, onSystem, vi.fn())
    expect(handled).toBe(true)
    expect(onSystem).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'Unknown command: /nope. Type /help for available commands.',
      })
    )
  })

  it('is case-insensitive on the command name', () => {
    const onSystem = vi.fn()
    handleCommand('/HELP', 'alex', 3, onSystem, vi.fn())
    expect(onSystem).toHaveBeenCalledWith(
      expect.objectContaining({ content: expect.stringContaining('Commands:') })
    )
  })
})
