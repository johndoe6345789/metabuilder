import type { PackageContent } from '../../../../package-types'

type IrcWebchatWorkflowActions = Pick<PackageContent, 'workflows' | 'luaScripts'>

export const eventActions: IrcWebchatWorkflowActions = {
  workflows: [
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
      parameters: [{ name: 'timestamp', type: 'number' }],
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
}
