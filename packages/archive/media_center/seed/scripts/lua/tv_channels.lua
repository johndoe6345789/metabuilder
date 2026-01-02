--[[
  TV channel operations
]]

---@class TvChannelsModule
local M = {}

local config = {
  base_url = "http://localhost:8090"
}

---Configure the helper
---@param opts table Configuration options
function M.configure(opts)
  if opts.base_url then config.base_url = opts.base_url end
end

---List TV channels
---@param tenant_id? string Tenant ID filter
---@return TvChannel[] channels List of channels
function M.list_channels(tenant_id)
  local url = config.base_url .. "/api/tv/channels"
  if tenant_id then
    url = url .. "?tenant_id=" .. tenant_id
  end
  -- HTTP GET would go here
  return {}
end

---Get a channel by ID
---@param channel_id string Channel ID
---@return TvChannel|nil channel Channel or nil
function M.get_channel(channel_id)
  if not channel_id or channel_id == "" then
    return nil
  end
  -- HTTP GET would go here
  return nil
end

---Toggle channel broadcast (start/stop)
---@param channel_id string Channel ID
---@return boolean success Whether successful
---@return string? error Error message
function M.toggle_channel(channel_id)
  if not channel_id or channel_id == "" then
    return false, "Channel ID is required"
  end

  local channel = M.get_channel(channel_id)
  if not channel then
    return false, "Channel not found"
  end

  if channel.is_live then
    return M.stop_channel(channel_id)
  else
    return M.start_channel(channel_id)
  end
end

---Start a channel
---@param channel_id string Channel ID
---@return boolean success Whether successful
---@return string? error Error message
function M.start_channel(channel_id)
  -- HTTP POST /api/tv/channels/:id/start
  return false, "Not implemented"
end

---Stop a channel
---@param channel_id string Channel ID
---@return boolean success Whether successful
---@return string? error Error message
function M.stop_channel(channel_id)
  -- HTTP POST /api/tv/channels/:id/stop
  return false, "Not implemented"
end

---Get stream URL for a channel
---@param channel_id string Channel ID
---@param quality? string Quality level (1080p, 720p, 480p, auto)
---@return string|nil url Stream URL or nil
function M.get_stream_url(channel_id, quality)
  if not channel_id or channel_id == "" then
    return nil
  end
  quality = quality or "auto"

  if quality == "auto" then
    return config.base_url .. "/hls/tv/" .. channel_id .. "/master.m3u8"
  else
    return config.base_url .. "/hls/tv/" .. channel_id .. "/" .. quality .. ".m3u8"
  end
end

return M
