-- irc_webchat/seed/scripts/db/operations.lua
-- DBAL operations for IRC entities (Channel, Message, Membership)
-- @module irc_webchat.db.operations

local M = {}
local json = require('json')

---------------------------------------------------------------------------
-- CHANNEL OPERATIONS
---------------------------------------------------------------------------

---@class IRCChannelCreateParams
---@field tenantId string
---@field name string Must start with #
---@field displayName string|nil
---@field description string|nil
---@field topic string|nil
---@field minLevel number|nil
---@field creatorId string

---Create a new IRC channel
---@param dbal table DBAL client instance
---@param params IRCChannelCreateParams
---@return table Created channel
function M.createChannel(dbal, params)
  -- Validate channel name starts with #
  local name = params.name
  if name:sub(1, 1) ~= '#' then
    name = '#' .. name
  end
  
  -- Check for duplicate channel name
  local existing = dbal:findFirst('IRCChannel', {
    where = { tenantId = params.tenantId, name = name },
  })
  
  if existing then
    error('Channel already exists: ' .. name)
  end
  
  return dbal:create('IRCChannel', {
    tenantId = params.tenantId,
    name = name,
    displayName = params.displayName or name:sub(2),
    description = params.description,
    topic = params.topic or 'Welcome to ' .. name,
    minLevel = params.minLevel or 0,
    isPrivate = false,
    isArchived = false,
    creatorId = params.creatorId,
    memberCount = 0,
    messageCount = 0,
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
    lastActivityAt = os.time() * 1000,
  })
end

---Get channel by name
---@param dbal table
---@param tenantId string
---@param name string
---@return table|nil Channel
function M.getChannelByName(dbal, tenantId, name)
  if name:sub(1, 1) ~= '#' then
    name = '#' .. name
  end
  
  return dbal:findFirst('IRCChannel', {
    where = { tenantId = tenantId, name = name },
  })
end

---List all channels
---@param dbal table
---@param tenantId string
---@param includeArchived boolean|nil
---@return table[] Channels
function M.listChannels(dbal, tenantId, includeArchived)
  local result = dbal:list('IRCChannel', {
    where = { tenantId = tenantId },
    orderBy = { memberCount = 'desc' },
    take = 100,
  })
  
  local channels = result.items or {}
  
  if not includeArchived then
    local active = {}
    for _, ch in ipairs(channels) do
      if not ch.isArchived then
        table.insert(active, ch)
      end
    end
    channels = active
  end
  
  return channels
end

---Update channel topic
---@param dbal table
---@param channelId string
---@param topic string
---@param userId string Who set the topic
---@return table Updated channel
function M.setTopic(dbal, channelId, topic, userId)
  return dbal:update('IRCChannel', channelId, {
    topic = topic,
    topicSetBy = userId,
    topicSetAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---Archive a channel
---@param dbal table
---@param channelId string
function M.archiveChannel(dbal, channelId)
  return dbal:update('IRCChannel', channelId, {
    isArchived = true,
    updatedAt = os.time() * 1000,
  })
end

---------------------------------------------------------------------------
-- MESSAGE OPERATIONS
---------------------------------------------------------------------------

---@class IRCMessageCreateParams
---@field tenantId string
---@field channelId string
---@field userId string
---@field username string
---@field displayName string|nil
---@field type string message|join|part|action|notice|system
---@field content string
---@field replyToId string|nil

---Send a message to a channel
---@param dbal table DBAL client instance
---@param params IRCMessageCreateParams
---@return table Created message
function M.sendMessage(dbal, params)
  local message = dbal:create('IRCMessage', {
    tenantId = params.tenantId,
    channelId = params.channelId,
    userId = params.userId,
    username = params.username,
    displayName = params.displayName or params.username,
    type = params.type or 'message',
    content = params.content,
    replyToId = params.replyToId,
    timestamp = os.time() * 1000,
  })
  
  -- Update channel stats
  local channel = dbal:read('IRCChannel', params.channelId)
  if channel then
    dbal:update('IRCChannel', params.channelId, {
      messageCount = (channel.messageCount or 0) + 1,
      lastActivityAt = os.time() * 1000,
      updatedAt = os.time() * 1000,
    })
  end
  
  return message
end

---Get channel messages (most recent first)
---@param dbal table
---@param channelId string
---@param take number|nil
---@param before number|nil Timestamp - get messages before this time
---@return table[] Messages
function M.getMessages(dbal, channelId, take, before)
  local result = dbal:list('IRCMessage', {
    where = { channelId = channelId },
    orderBy = { timestamp = 'desc' },
    take = take or 50,
  })
  
  local messages = result.items or {}
  
  -- Filter by timestamp if specified
  if before then
    local filtered = {}
    for _, msg in ipairs(messages) do
      if msg.timestamp < before then
        table.insert(filtered, msg)
      end
    end
    messages = filtered
  end
  
  -- Reverse to get chronological order for display
  local reversed = {}
  for i = #messages, 1, -1 do
    table.insert(reversed, messages[i])
  end
  
  return reversed
end

---Send a system message
---@param dbal table
---@param tenantId string
---@param channelId string
---@param content string
function M.sendSystemMessage(dbal, tenantId, channelId, content)
  return M.sendMessage(dbal, {
    tenantId = tenantId,
    channelId = channelId,
    userId = 'system',
    username = '*system*',
    type = 'system',
    content = content,
  })
end

---Delete a message (mark as deleted)
---@param dbal table
---@param messageId string
---@param deletedBy string
function M.deleteMessage(dbal, messageId, deletedBy)
  return dbal:update('IRCMessage', messageId, {
    content = '[deleted by ' .. deletedBy .. ']',
    type = 'system',
  })
end

---------------------------------------------------------------------------
-- MEMBERSHIP OPERATIONS
---------------------------------------------------------------------------

---@class IRCMembershipParams
---@field tenantId string
---@field channelId string
---@field userId string
---@field username string
---@field role string owner|operator|voiced|member

---Join a channel
---@param dbal table DBAL client instance
---@param params IRCMembershipParams
---@return table Membership record
function M.joinChannel(dbal, params)
  -- Check if already a member
  local existing = dbal:findFirst('IRCMembership', {
    where = {
      channelId = params.channelId,
      userId = params.userId,
    },
  })
  
  if existing then
    -- Update last seen
    return dbal:update('IRCMembership', existing.id, {
      isOnline = true,
      lastSeenAt = os.time() * 1000,
    })
  end
  
  local membership = dbal:create('IRCMembership', {
    tenantId = params.tenantId,
    channelId = params.channelId,
    userId = params.userId,
    username = params.username,
    role = params.role or 'member',
    isOnline = true,
    joinedAt = os.time() * 1000,
    lastSeenAt = os.time() * 1000,
  })
  
  -- Update channel member count
  local channel = dbal:read('IRCChannel', params.channelId)
  if channel then
    dbal:update('IRCChannel', params.channelId, {
      memberCount = (channel.memberCount or 0) + 1,
      updatedAt = os.time() * 1000,
    })
  end
  
  -- Send join message
  M.sendMessage(dbal, {
    tenantId = params.tenantId,
    channelId = params.channelId,
    userId = params.userId,
    username = params.username,
    type = 'join',
    content = params.username .. ' has joined the channel',
  })
  
  return membership
end

---Leave a channel
---@param dbal table
---@param channelId string
---@param userId string
---@param message string|nil Part message
function M.leaveChannel(dbal, channelId, userId, message)
  local membership = dbal:findFirst('IRCMembership', {
    where = { channelId = channelId, userId = userId },
  })
  
  if not membership then
    return false
  end
  
  -- Send part message
  local channel = dbal:read('IRCChannel', channelId)
  M.sendMessage(dbal, {
    tenantId = membership.tenantId,
    channelId = channelId,
    userId = userId,
    username = membership.username,
    type = 'part',
    content = membership.username .. ' has left' .. (message and (': ' .. message) or ''),
  })
  
  -- Delete membership
  dbal:delete('IRCMembership', membership.id)
  
  -- Update channel member count
  if channel then
    dbal:update('IRCChannel', channelId, {
      memberCount = math.max(0, (channel.memberCount or 1) - 1),
      updatedAt = os.time() * 1000,
    })
  end
  
  return true
end

---Get channel members
---@param dbal table
---@param channelId string
---@param onlineOnly boolean|nil
---@return table[] Members
function M.getMembers(dbal, channelId, onlineOnly)
  local result = dbal:list('IRCMembership', {
    where = { channelId = channelId },
    orderBy = { role = 'asc', username = 'asc' },
    take = 500,
  })
  
  local members = result.items or {}
  
  if onlineOnly then
    local online = {}
    for _, m in ipairs(members) do
      if m.isOnline then
        table.insert(online, m)
      end
    end
    members = online
  end
  
  return members
end

---Set user's online status
---@param dbal table
---@param channelId string
---@param userId string
---@param isOnline boolean
function M.setOnlineStatus(dbal, channelId, userId, isOnline)
  local membership = dbal:findFirst('IRCMembership', {
    where = { channelId = channelId, userId = userId },
  })
  
  if membership then
    dbal:update('IRCMembership', membership.id, {
      isOnline = isOnline,
      lastSeenAt = os.time() * 1000,
    })
  end
end

---Update user role in channel
---@param dbal table
---@param channelId string
---@param userId string
---@param role string owner|operator|voiced|member
function M.setRole(dbal, channelId, userId, role)
  local membership = dbal:findFirst('IRCMembership', {
    where = { channelId = channelId, userId = userId },
  })
  
  if membership then
    dbal:update('IRCMembership', membership.id, { role = role })
  end
end

---Get channels a user is in
---@param dbal table
---@param userId string
---@return table[] Channels
function M.getUserChannels(dbal, userId)
  local memberships = dbal:list('IRCMembership', {
    where = { userId = userId },
    take = 100,
  })
  
  local channels = {}
  for _, m in ipairs(memberships.items or {}) do
    local channel = dbal:read('IRCChannel', m.channelId)
    if channel and not channel.isArchived then
      table.insert(channels, channel)
    end
  end
  
  return channels
end

return M
