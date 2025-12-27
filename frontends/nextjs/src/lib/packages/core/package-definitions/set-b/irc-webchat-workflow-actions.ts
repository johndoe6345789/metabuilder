import type { PackageContent } from '../../package-types'

type IrcWebchatWorkflows = Pick<PackageContent, 'workflows' | 'luaScripts'>

export const createIrcWebchatWorkflowActions = (): IrcWebchatWorkflows => ({
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
})
