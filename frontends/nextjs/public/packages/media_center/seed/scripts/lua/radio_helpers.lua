---@class RadioChannel
---@field id string Channel ID
---@field name string Channel name
---@field slug string URL slug
---@field description? string Description
---@field artwork_url? string Artwork URL
---@field is_live boolean Whether streaming
---@field listener_count number Current listeners
---@field now_playing? RadioTrack Current track

---@class RadioTrack
---@field id string Track ID
---@field title string Track title
---@field artist string Artist name
---@field album? string Album name
---@field duration_ms number Duration in ms

---@class RadioHelpersModule
---@field list_channels fun(tenant_id?: string): RadioChannel[] List radio channels
---@field get_channel fun(channel_id: string): RadioChannel|nil Get channel
---@field toggle_play fun(channel_id: string): boolean, string? Start or stop channel
---@field get_now_playing fun(channel_id: string): RadioTrack|nil Get current track
---@field get_stream_url fun(channel_id: string): string|nil Get stream URL
local M = {}

local config = {
  base_url = "http://localhost:8090"
}

---Configure the helper
---@param opts table Configuration options
function M.configure(opts)
  if opts.base_url then config.base_url = opts.base_url end
end

---List radio channels
---@param tenant_id? string Tenant ID filter
---@return RadioChannel[] channels List of channels
function M.list_channels(tenant_id)
  local url = config.base_url .. "/api/radio/channels"
  if tenant_id then
    url = url .. "?tenant_id=" .. tenant_id
  end
  -- HTTP GET would go here
  return {}
end

---Get a channel by ID
---@param channel_id string Channel ID
---@return RadioChannel|nil channel Channel or nil
function M.get_channel(channel_id)
  if not channel_id or channel_id == "" then
    return nil
  end
  -- HTTP GET would go here
  return nil
end

---Toggle channel playback (start/stop)
---@param channel_id string Channel ID
---@return boolean success Whether successful
---@return string? error Error message
function M.toggle_play(channel_id)
  if not channel_id or channel_id == "" then
    return false, "Channel ID is required"
  end
  
  local channel = M.get_channel(channel_id)
  if not channel then
    return false, "Channel not found"
  end
  
  if channel.is_live then
    -- Stop the channel
    return M.stop_channel(channel_id)
  else
    -- Start the channel
    return M.start_channel(channel_id)
  end
end

---Start a channel
---@param channel_id string Channel ID
---@return boolean success Whether successful
---@return string? error Error message
function M.start_channel(channel_id)
  -- HTTP POST /api/radio/channels/:id/start
  return false, "Not implemented"
end

---Stop a channel
---@param channel_id string Channel ID
---@return boolean success Whether successful
---@return string? error Error message
function M.stop_channel(channel_id)
  -- HTTP POST /api/radio/channels/:id/stop
  return false, "Not implemented"
end

---Get now playing track
---@param channel_id string Channel ID
---@return RadioTrack|nil track Current track or nil
function M.get_now_playing(channel_id)
  if not channel_id or channel_id == "" then
    return nil
  end
  -- HTTP GET /api/radio/channels/:id/now
  return nil
end

---Get stream URL for a channel
---@param channel_id string Channel ID
---@return string|nil url Stream URL or nil
function M.get_stream_url(channel_id)
  if not channel_id or channel_id == "" then
    return nil
  end
  -- Would return HLS or Icecast URL
  return config.base_url .. "/hls/radio/" .. channel_id .. "/stream.m3u8"
end

---Format duration for display
---@param duration_ms number Duration in milliseconds
---@return string formatted Formatted duration (MM:SS)
function M.format_duration(duration_ms)
  local total_seconds = math.floor(duration_ms / 1000)
  local minutes = math.floor(total_seconds / 60)
  local seconds = total_seconds % 60
  return string.format("%d:%02d", minutes, seconds)
end

---Get listener count display text
---@param count number Listener count
---@return string text Display text
function M.format_listener_count(count)
  if count == 0 then
    return "No listeners"
  elseif count == 1 then
    return "1 listener"
  else
    return tostring(count) .. " listeners"
  end
end

return M
