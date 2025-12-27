import type { PackageContent, PackageManifest } from '../../package-types'

export const ircWebchatPackage = (): { manifest: PackageManifest; content: PackageContent } => ({
  manifest: {
    id: 'irc-webchat',
    name: 'IRC-Style Webchat',
    version: '1.0.0',
    description: 'Classic IRC-style webchat with channels, commands, online users, and real-time messaging. Perfect for community chat rooms.',
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
  },
  content: {
    schemas: [
      {
        name: 'ChatChannel',
        displayName: 'Chat Channel',
        fields: [
          { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
          { name: 'name', type: 'string', label: 'Channel Name', required: true },
          { name: 'description', type: 'text', label: 'Description', required: false },
          { name: 'topic', type: 'string', label: 'Channel Topic', required: false },
          { name: 'isPrivate', type: 'boolean', label: 'Private', required: false, defaultValue: false },
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
    pages: [
      {
        id: 'page_chat',
        path: '/chat',
        title: 'IRC Webchat',
        level: 2,
        componentTree: [
          {
            id: 'comp_chat_root',
            type: 'IRCWebchat',
            props: {
              channelName: 'general',
            },
            children: [],
          },
        ],
        requiresAuth: true,
        requiredRole: 'user',
      },
    ],
    workflows: [
      {
        id: 'workflow_send_message',
        name: 'Send Chat Message',
        description: 'Workflow for sending a chat message',
        nodes: [],
        edges: [],
        enabled: true,
      },
      {
        id: 'workflow_join_channel',
        name: 'Join Channel',
        description: 'Workflow for joining a chat channel',
        nodes: [],
        edges: [],
        enabled: true,
      },
    ],
    luaScripts: [
      {
        id: 'lua_irc_send_message',
        name: 'Send IRC Message',
        description: 'Sends a message to the chat channel',
        code: `-- Send IRC Message
function sendMessage(channelId, username, userId, message)
local msgId = "msg_" .. tostring(os.time()) .. "_" .. math.random(1000, 9999)
local msg = {
  id = msgId,
  channelId = channelId,
  username = username,
  userId = userId,
  message = message,
  type = "message",
  timestamp = os.time() * 1000
}
log("Sending message: " .. message)
return msg
end

return sendMessage`,
        parameters: [
          { name: 'channelId', type: 'string' },
          { name: 'username', type: 'string' },
          { name: 'userId', type: 'string' },
          { name: 'message', type: 'string' },
        ],
        returnType: 'table',
      },
      {
        id: 'lua_irc_handle_command',
        name: 'Handle IRC Command',
        description: 'Processes IRC commands like /help, /users, etc',
        code: `-- Handle IRC Command
function handleCommand(command, channelId, username, onlineUsers)
local parts = {}
for part in string.gmatch(command, "%S+") do
  table.insert(parts, part)
end

local cmd = parts[1]:lower()
local response = {
  id = "msg_" .. tostring(os.time()) .. "_" .. math.random(1000, 9999),
  username = "System",
  userId = "system",
  type = "system",
  timestamp = os.time() * 1000,
  channelId = channelId
}

if cmd == "/help" then
  response.message = "Available commands: /help, /users, /clear, /me <action>"
elseif cmd == "/users" then
  local userCount = #onlineUsers
  local userList = table.concat(onlineUsers, ", ")
  response.message = "Online users (" .. userCount .. "): " .. userList
elseif cmd == "/clear" then
  response.message = "CLEAR_MESSAGES"
  response.type = "command"
elseif cmd == "/me" then
  if #parts > 1 then
    local action = table.concat(parts, " ", 2)
    response.message = action
    response.username = username
    response.userId = username
    response.type = "system"
  else
    response.message = "Usage: /me <action>"
  end
else
  response.message = "Unknown command: " .. cmd .. ". Type /help for available commands."
end

return response
end

return handleCommand`,
        parameters: [
          { name: 'command', type: 'string' },
          { name: 'channelId', type: 'string' },
          { name: 'username', type: 'string' },
          { name: 'onlineUsers', type: 'table' },
        ],
        returnType: 'table',
      },
      {
        id: 'lua_irc_format_time',
        name: 'Format Timestamp',
        description: 'Formats a timestamp for display',
        code: `-- Format Timestamp
function formatTime(timestamp)
local date = os.date("*t", timestamp / 1000)
local hour = date.hour
local ampm = "AM"

if hour >= 12 then
  ampm = "PM"
  if hour > 12 then
    hour = hour - 12
  end
end

if hour == 0 then
  hour = 12
end

return string.format("%02d:%02d %s", hour, date.min, ampm)
end

return formatTime`,
        parameters: [
          { name: 'timestamp', type: 'number' },
        ],
        returnType: 'string',
      },
      {
        id: 'lua_irc_user_join',
        name: 'User Join Channel',
        description: 'Handles user joining a channel',
        code: `-- User Join Channel
function userJoin(channelId, username, userId)
local joinMsg = {
  id = "msg_" .. tostring(os.time()) .. "_" .. math.random(1000, 9999),
  channelId = channelId,
  username = "System",
  userId = "system",
  message = username .. " has joined the channel",
  type = "join",
  timestamp = os.time() * 1000
}

log(username .. " joined channel " .. channelId)
return joinMsg
end

return userJoin`,
        parameters: [
          { name: 'channelId', type: 'string' },
          { name: 'username', type: 'string' },
          { name: 'userId', type: 'string' },
        ],
        returnType: 'table',
      },
      {
        id: 'lua_irc_user_leave',
        name: 'User Leave Channel',
        description: 'Handles user leaving a channel',
        code: `-- User Leave Channel
function userLeave(channelId, username, userId)
local leaveMsg = {
  id = "msg_" .. tostring(os.time()) .. "_" .. math.random(1000, 9999),
  channelId = channelId,
  username = "System",
  userId = "system",
  message = username .. " has left the channel",
  type = "leave",
  timestamp = os.time() * 1000
}

log(username .. " left channel " .. channelId)
return leaveMsg
end

return userLeave`,
        parameters: [
          { name: 'channelId', type: 'string' },
          { name: 'username', type: 'string' },
          { name: 'userId', type: 'string' },
        ],
        returnType: 'table',
      },
    ],
    componentHierarchy: {
      page_chat: {
        id: 'comp_chat_root',
        type: 'IRCWebchat',
        props: {},
        children: [],
      },
    },
    componentConfigs: {
      IRCWebchat: {
        type: 'IRCWebchat',
        category: 'social',
        label: 'IRC Webchat',
        description: 'IRC-style chat component with channels and commands',
        icon: '💬',
        props: [
          {
            name: 'channelName',
            type: 'string',
            label: 'Channel Name',
            defaultValue: 'general',
            required: false,
          },
          {
            name: 'showSettings',
            type: 'boolean',
            label: 'Show Settings',
            defaultValue: false,
            required: false,
          },
          {
            name: 'height',
            type: 'string',
            label: 'Height',
            defaultValue: '600px',
            required: false,
          },
        ],
        config: {
          layout: 'Card',
          styling: {
            className: 'h-[600px] flex flex-col',
          },
          children: [
            {
              id: 'header',
              type: 'CardHeader',
              props: {
                className: 'border-b border-border pb-3',
              },
              children: [
                {
                  id: 'title_container',
                  type: 'Flex',
                  props: {
                    className: 'flex items-center justify-between',
                  },
                  children: [
                    {
                      id: 'title',
                      type: 'CardTitle',
                      props: {
                        className: 'flex items-center gap-2 text-lg',
                        content: '#{channelName}',
                      },
                    },
                    {
                      id: 'actions',
                      type: 'Flex',
                      props: {
                        className: 'flex items-center gap-2',
                      },
                      children: [
                        {
                          id: 'user_badge',
                          type: 'Badge',
                          props: {
                            variant: 'secondary',
                            className: 'gap-1.5',
                            icon: 'Users',
                            content: '{onlineUsersCount}',
                          },
                        },
                        {
                          id: 'settings_button',
                          type: 'Button',
                          props: {
                            size: 'sm',
                            variant: 'ghost',
                            icon: 'Gear',
                            onClick: 'toggleSettings',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'content',
              type: 'CardContent',
              props: {
                className: 'flex-1 flex flex-col p-0 overflow-hidden',
              },
              children: [
                {
                  id: 'main_area',
                  type: 'Flex',
                  props: {
                    className: 'flex flex-1 overflow-hidden',
                  },
                  children: [
                    {
                      id: 'messages_area',
                      type: 'ScrollArea',
                      props: {
                        className: 'flex-1 p-4',
                      },
                      children: [
                        {
                          id: 'messages_container',
                          type: 'MessageList',
                          props: {
                            className: 'space-y-2 font-mono text-sm',
                            dataSource: 'messages',
                            itemRenderer: 'renderMessage',
                          },
                        },
                      ],
                    },
                    {
                      id: 'sidebar',
                      type: 'Container',
                      props: {
                        className: 'w-48 border-l border-border p-4 bg-muted/20',
                        conditional: 'showSettings',
                      },
                      children: [
                        {
                          id: 'sidebar_title',
                          type: 'Heading',
                          props: {
                            level: '4',
                            className: 'font-semibold text-sm mb-3',
                            content: 'Online Users',
                          },
                        },
                        {
                          id: 'users_list',
                          type: 'UserList',
                          props: {
                            className: 'space-y-1.5 text-sm',
                            dataSource: 'onlineUsers',
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'input_area',
                  type: 'Container',
                  props: {
                    className: 'border-t border-border p-4',
                  },
                  children: [
                    {
                      id: 'input_row',
                      type: 'Flex',
                      props: {
                        className: 'flex gap-2',
                      },
                      children: [
                        {
                          id: 'message_input',
                          type: 'Input',
                          props: {
                            className: 'flex-1 font-mono',
                            placeholder: 'Type a message... (/help for commands)',
                            onKeyPress: 'handleKeyPress',
                            value: '{inputMessage}',
                            onChange: 'updateInputMessage',
                          },
                        },
                        {
                          id: 'send_button',
                          type: 'Button',
                          props: {
                            size: 'icon',
                            icon: 'PaperPlaneTilt',
                            onClick: 'handleSendMessage',
                          },
                        },
                      ],
                    },
                    {
                      id: 'help_text',
                      type: 'Text',
                      props: {
                        className: 'text-xs text-muted-foreground mt-2',
                        content: 'Press Enter to send. Type /help for commands.',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    },
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
  },
},
}
})
