import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/components/irc-webchat', () => ({
  IrcChatShell: () => <div data-testid="irc-chat-shell">IRC Chat Shell</div>,
}))

import { ChatContent } from './ChatContent'

describe('ChatContent', () => {
  it('renders the IrcChatShell inside its wrapper', () => {
    render(<ChatContent />)
    expect(screen.getByTestId('irc-chat-shell')).toBeTruthy()
  })
})
