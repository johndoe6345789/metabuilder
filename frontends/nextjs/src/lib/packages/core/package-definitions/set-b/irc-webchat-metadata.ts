import type { PackageManifest } from '../../package-types'

export const createIrcWebchatMetadata = (): PackageManifest => ({
  id: 'irc-webchat',
  name: 'IRC-Style Webchat',
  version: '1.0.0',
  description:
    'Classic IRC-style webchat with channels, commands, online users, and real-time messaging. Perfect for community chat rooms.',
  author: 'MetaBuilder Team',
  category: 'social',
  icon: '💬',
  screenshots: [],
  tags: ['chat', 'irc', 'messaging', 'realtime'],
  dependencies: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  downloadCount: 1543,
  rating: 4.8,
  installed: false,
})
