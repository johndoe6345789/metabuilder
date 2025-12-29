import type { PackageContent } from '../../package-types'

type IrcWebchatValidation = Pick<PackageContent, 'schemas' | 'seedData'>

export const createIrcWebchatValidation = (): IrcWebchatValidation => ({
  schemas: [
    {
      name: 'ChatChannel',
      displayName: 'Chat Channel',
      fields: [
        { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
        { name: 'name', type: 'string', label: 'Channel Name', required: true },
        { name: 'description', type: 'text', label: 'Description', required: false },
        { name: 'topic', type: 'string', label: 'Channel Topic', required: false },
        {
          name: 'isPrivate',
          type: 'boolean',
          label: 'Private',
          required: false,
          defaultValue: false,
        },
        { name: 'createdBy', type: 'string', label: 'Created By', required: true },
        { name: 'createdAt', type: 'number', label: 'Created At', required: true },
      ],
    },
    {
      name: 'ChatMessage',
      displayName: 'Chat Message',
      fields: [
        { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
        { name: 'channelId', type: 'string', label: 'Channel ID', required: true },
        { name: 'username', type: 'string', label: 'Username', required: true },
        { name: 'userId', type: 'string', label: 'User ID', required: true },
        { name: 'message', type: 'text', label: 'Message', required: true },
        { name: 'type', type: 'string', label: 'Message Type', required: true },
        { name: 'timestamp', type: 'number', label: 'Timestamp', required: true },
      ],
    },
    {
      name: 'ChatUser',
      displayName: 'Chat User',
      fields: [
        { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
        { name: 'channelId', type: 'string', label: 'Channel ID', required: true },
        { name: 'username', type: 'string', label: 'Username', required: true },
        { name: 'userId', type: 'string', label: 'User ID', required: true },
        { name: 'joinedAt', type: 'number', label: 'Joined At', required: true },
      ],
    },
  ],
  seedData: {
    ChatChannel: [
      {
        id: 'channel_general',
        name: 'general',
        description: 'General discussion',
        topic: 'Welcome to the general chat!',
        isPrivate: false,
        createdBy: 'system',
        createdAt: Date.now(),
      },
      {
        id: 'channel_random',
        name: 'random',
        description: 'Random conversations',
        topic: 'Talk about anything here',
        isPrivate: false,
        createdBy: 'system',
        createdAt: Date.now(),
      },
    ],
  },
})
