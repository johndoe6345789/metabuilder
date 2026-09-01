import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

const webchatHook = vi.hoisted(() => ({ useWebchat: vi.fn() }))
vi.mock('./use-webchat', () => webchatHook)

import { Webchat } from './Webchat'

const msg = {
  id: 'm1',
  sender: 'you',
  text: 'hello',
  at: Date.parse('2026-01-01T12:00:00Z'),
}

function mockChat(overrides: Partial<ReturnType<typeof baseChat>> = {}) {
  webchatHook.useWebchat.mockReturnValue({ ...baseChat(), ...overrides })
}

function baseChat() {
  return { messages: [], draft: '', setDraft: vi.fn(), send: vi.fn() }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockChat()
})

describe('Webchat', () => {
  it('strips a leading # from the channel name for display', () => {
    render(<Webchat channel="#general" />)
    expect(screen.getByText('general')).toBeTruthy()
  })

  it('shows the message count', () => {
    mockChat({ messages: [msg] })
    render(<Webchat />)
    expect(screen.getByText('1 messages')).toBeTruthy()
  })

  it('marks messages from the current sender as "mine"', () => {
    mockChat({ messages: [msg] })
    render(<Webchat sender="you" />)
    const row = screen.getByText('hello').parentElement?.parentElement
    expect(row?.className).toContain('mine')
  })

  it('does not mark messages from someone else as "mine"', () => {
    mockChat({ messages: [{ ...msg, sender: 'other' }] })
    render(<Webchat sender="you" />)
    const row = screen.getByText('hello').parentElement?.parentElement
    expect(row?.className).not.toContain('mine')
  })

  it('reports draft edits', () => {
    const setDraft = vi.fn()
    mockChat({ setDraft })
    render(<Webchat channel="#general" />)
    fireEvent.change(screen.getByPlaceholderText('Message #general'), {
      target: { value: 'hi' },
    })
    expect(setDraft).toHaveBeenCalledWith('hi')
  })

  it('sends on Enter and from the Send button', () => {
    const send = vi.fn()
    mockChat({ send })
    render(<Webchat channel="#general" />)
    fireEvent.keyDown(screen.getByPlaceholderText('Message #general'), {
      key: 'Enter',
    })
    fireEvent.click(screen.getByText('Send'))
    expect(send).toHaveBeenCalledTimes(2)
  })
})
