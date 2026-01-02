-- stream_cast/seed/scripts/db/operations.lua
-- DBAL operations for StreamChannel, StreamSchedule, StreamScene entities
-- @module stream_cast.db.operations

local M = {}
local json = require('json')

---------------------------------------------------------------------------
-- STREAM CHANNEL OPERATIONS
---------------------------------------------------------------------------

---@class StreamChannelCreateParams
---@field tenantId string
---@field name string
---@field description string|nil
---@field category string|nil
---@field createdBy string

---Create a new streaming channel
---@param dbal table DBAL client instance
---@param params StreamChannelCreateParams
---@return table Created channel
function M.createChannel(dbal, params)
  local slug = M._slugify(params.name)
  
  -- Generate stream key
  local streamKey = M._generateKey()
  
  return dbal:create('StreamChannel', {
    tenantId = params.tenantId,
    name = params.name,
    slug = slug,
    description = params.description,
    category = params.category,
    status = 'offline',
    viewerCount = 0,
    streamKey = streamKey,
    chatEnabled = true,
    isPublic = true,
    isMature = false,
    createdAt = os.time() * 1000,
    createdBy = params.createdBy,
  })
end

---Get channel by ID
---@param dbal table
---@param channelId string
---@return table|nil Channel
function M.getChannel(dbal, channelId)
  return dbal:read('StreamChannel', channelId)
end

---Get channel by slug
---@param dbal table
---@param tenantId string
---@param slug string
---@return table|nil Channel
function M.getChannelBySlug(dbal, tenantId, slug)
  return dbal:findFirst('StreamChannel', {
    where = { tenantId = tenantId, slug = slug },
  })
end

---List all channels
---@param dbal table
---@param tenantId string
---@param status string|nil Filter by status (live, offline, scheduled)
---@param category string|nil Filter by category
---@param take number|nil
---@param skip number|nil
---@return table List result
function M.listChannels(dbal, tenantId, status, category, take, skip)
  local where = { tenantId = tenantId, isPublic = true }
  
  if status then
    where.status = status
  end
  
  local result = dbal:list('StreamChannel', {
    where = where,
    orderBy = { viewerCount = 'desc' },
    take = take or 20,
    skip = skip or 0,
  })
  
  -- Filter by category if specified
  if category and result.items then
    local filtered = {}
    for _, ch in ipairs(result.items) do
      if ch.category == category then
        table.insert(filtered, ch)
      end
    end
    result.items = filtered
  end
  
  return result
end

---List live channels
---@param dbal table
---@param tenantId string
---@param take number|nil
---@return table[] Live channels
function M.listLiveChannels(dbal, tenantId, take)
  local result = M.listChannels(dbal, tenantId, 'live', nil, take, 0)
  return result.items or {}
end

---Update channel info
---@param dbal table
---@param channelId string
---@param updates table
---@return table Updated channel
function M.updateChannel(dbal, channelId, updates)
  updates.updatedAt = os.time() * 1000
  return dbal:update('StreamChannel', channelId, updates)
end

---Go live
---@param dbal table
---@param channelId string
---@param rtmpUrl string
---@param hlsUrl string|nil
---@return table Updated channel
function M.goLive(dbal, channelId, rtmpUrl, hlsUrl)
  return M.updateChannel(dbal, channelId, {
    status = 'live',
    rtmpUrl = rtmpUrl,
    hlsUrl = hlsUrl,
    viewerCount = 0,
  })
end

---Go offline
---@param dbal table
---@param channelId string
---@return table Updated channel
function M.goOffline(dbal, channelId)
  return M.updateChannel(dbal, channelId, {
    status = 'offline',
    rtmpUrl = nil,
    hlsUrl = nil,
    viewerCount = 0,
  })
end

---Update viewer count
---@param dbal table
---@param channelId string
---@param count number
---@return table Updated channel
function M.updateViewerCount(dbal, channelId, count)
  return dbal:update('StreamChannel', channelId, {
    viewerCount = count,
  })
end

---Increment viewer count
---@param dbal table
---@param channelId string
function M.viewerJoined(dbal, channelId)
  local channel = M.getChannel(dbal, channelId)
  if channel then
    M.updateViewerCount(dbal, channelId, (channel.viewerCount or 0) + 1)
  end
end

---Decrement viewer count
---@param dbal table
---@param channelId string
function M.viewerLeft(dbal, channelId)
  local channel = M.getChannel(dbal, channelId)
  if channel then
    M.updateViewerCount(dbal, channelId, math.max(0, (channel.viewerCount or 1) - 1))
  end
end

---Regenerate stream key
---@param dbal table
---@param channelId string
---@return string New stream key
function M.regenerateStreamKey(dbal, channelId)
  local newKey = M._generateKey()
  M.updateChannel(dbal, channelId, { streamKey = newKey })
  return newKey
end

---------------------------------------------------------------------------
-- STREAM SCHEDULE OPERATIONS
---------------------------------------------------------------------------

---@class StreamScheduleCreateParams
---@field tenantId string
---@field channelId string
---@field title string
---@field description string|nil
---@field scheduledAt number Unix timestamp
---@field duration number|nil Duration in minutes

---Schedule a stream
---@param dbal table
---@param params StreamScheduleCreateParams
---@return table Created schedule
function M.scheduleStream(dbal, params)
  return dbal:create('StreamSchedule', {
    tenantId = params.tenantId,
    channelId = params.channelId,
    title = params.title,
    description = params.description,
    scheduledAt = params.scheduledAt * 1000,
    duration = params.duration or 60,
    status = 'scheduled',
    createdAt = os.time() * 1000,
  })
end

---List upcoming schedules
---@param dbal table
---@param channelId string
---@param take number|nil
---@return table[] Schedules
function M.listUpcomingSchedules(dbal, channelId, take)
  local now = os.time() * 1000
  local result = dbal:list('StreamSchedule', {
    where = { channelId = channelId },
    orderBy = { scheduledAt = 'asc' },
    take = take or 10,
  })
  
  -- Filter to only future schedules
  local upcoming = {}
  for _, schedule in ipairs(result.items or {}) do
    if schedule.scheduledAt > now and schedule.status == 'scheduled' then
      table.insert(upcoming, schedule)
    end
  end
  
  return upcoming
end

---Mark schedule as started
---@param dbal table
---@param scheduleId string
function M.startScheduledStream(dbal, scheduleId)
  return dbal:update('StreamSchedule', scheduleId, {
    status = 'live',
    startedAt = os.time() * 1000,
  })
end

---Mark schedule as completed
---@param dbal table
---@param scheduleId string
function M.completeScheduledStream(dbal, scheduleId)
  return dbal:update('StreamSchedule', scheduleId, {
    status = 'completed',
    endedAt = os.time() * 1000,
  })
end

---Cancel a scheduled stream
---@param dbal table
---@param scheduleId string
function M.cancelScheduledStream(dbal, scheduleId)
  return dbal:update('StreamSchedule', scheduleId, {
    status = 'cancelled',
  })
end

---------------------------------------------------------------------------
-- STREAM SCENE OPERATIONS
---------------------------------------------------------------------------

---@class StreamSceneCreateParams
---@field tenantId string
---@field channelId string
---@field name string
---@field layout table Scene layout configuration

---Create a scene
---@param dbal table
---@param params StreamSceneCreateParams
---@return table Created scene
function M.createScene(dbal, params)
  -- Get max sort order
  local existing = dbal:list('StreamScene', {
    where = { channelId = params.channelId },
    orderBy = { sortOrder = 'desc' },
    take = 1,
  })
  
  local maxOrder = 0
  if existing.items and #existing.items > 0 then
    maxOrder = existing.items[1].sortOrder or 0
  end
  
  return dbal:create('StreamScene', {
    tenantId = params.tenantId,
    channelId = params.channelId,
    name = params.name,
    layout = json.encode(params.layout),
    isActive = false,
    sortOrder = maxOrder + 1,
    createdAt = os.time() * 1000,
  })
end

---List scenes for a channel
---@param dbal table
---@param channelId string
---@return table[] Scenes
function M.listScenes(dbal, channelId)
  local result = dbal:list('StreamScene', {
    where = { channelId = channelId },
    orderBy = { sortOrder = 'asc' },
    take = 50,
  })
  return result.items or {}
end

---Activate a scene (deactivates others)
---@param dbal table
---@param channelId string
---@param sceneId string
function M.activateScene(dbal, channelId, sceneId)
  -- Deactivate all scenes for this channel
  local scenes = M.listScenes(dbal, channelId)
  for _, scene in ipairs(scenes) do
    if scene.isActive then
      dbal:update('StreamScene', scene.id, { isActive = false })
    end
  end
  
  -- Activate the selected scene
  dbal:update('StreamScene', sceneId, { isActive = true })
end

---Update scene layout
---@param dbal table
---@param sceneId string
---@param layout table
function M.updateSceneLayout(dbal, sceneId, layout)
  return dbal:update('StreamScene', sceneId, {
    layout = json.encode(layout),
    updatedAt = os.time() * 1000,
  })
end

---Delete a scene
---@param dbal table
---@param sceneId string
function M.deleteScene(dbal, sceneId)
  return dbal:delete('StreamScene', sceneId)
end

---------------------------------------------------------------------------
-- UTILITY FUNCTIONS
---------------------------------------------------------------------------

---Generate URL-safe slug
---@param text string
---@return string
function M._slugify(text)
  local slug = text:lower()
  slug = slug:gsub('[^%w%s-]', '')
  slug = slug:gsub('%s+', '-')
  slug = slug:gsub('-+', '-')
  slug = slug:gsub('^-', ''):gsub('-$', '')
  return slug:sub(1, 50)
end

---Generate random stream key
---@return string
function M._generateKey()
  local chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  local key = 'sk_'
  for _ = 1, 24 do
    local idx = math.random(1, #chars)
    key = key .. chars:sub(idx, idx)
  end
  return key
end

return M
