/**
 * handleCommand — processes IRC slash commands
 * Returns true if command was handled, false for plain messages
 */
import type { IrcMessage } from './types'

type SystemFn = (msg: Omit<IrcMessage, 'id' | 'channelId' | 'tenantId'>) => void

const HELP_TEXT =
  'Commands: /help | /clear — clear messages' +
  ' | /me <action> | /users — member count'

export function handleCommand(
  text: string,
  username: string,
  memberCount: number,
  onSystem: SystemFn,
  onClear: () => void
): boolean {
  if (!text.startsWith('/')) return false

  const parts = text.split(' ')
  const cmd = (parts[0] ?? '').toLowerCase()
  const now = new Date().toISOString()

  const sys = (content: string) =>
    onSystem({
      content,
      createdBy: 'System',
      createdAt: now,
      type: 'system',
    })

  if (cmd === '/help') {
    sys(HELP_TEXT)
    return true
  }
  if (cmd === '/clear') {
    onClear()
    return true
  }
  if (cmd === '/users') {
    sys(`Members: ${memberCount}`)
    return true
  }
  if (cmd === '/me') {
    const action = parts.slice(1).join(' ').trim()
    if (action !== '') {
      onSystem({
        content: action,
        createdBy: username,
        createdAt: now,
        type: 'me',
      })
    }
    return true
  }

  sys(`Unknown command: ${cmd}. Type /help for available commands.`)
  return true
}
