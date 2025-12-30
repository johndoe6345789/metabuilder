---@class TvChannel
---@field id string Channel ID
---@field channel_number number Channel number
---@field name string Channel name
---@field slug string URL slug
---@field description? string Description
---@field logo_url? string Logo URL
---@field category string Channel category
---@field is_live boolean Whether streaming
---@field viewer_count number Current viewers
---@field now_playing? TvProgram Current program
---@field hls_url? string HLS stream URL

---@class TvProgram
---@field id string Program ID
---@field title string Program title
---@field description? string Description
---@field category string Program category
---@field duration_seconds number Duration in seconds
---@field rating string Content rating

---@class TvScheduleEntry
---@field id string Entry ID
---@field program TvProgram Program info
---@field start_time string ISO timestamp
---@field end_time string ISO timestamp
---@field is_live boolean Whether live broadcast

---@class TvHelpersModule
---@field list_channels fun(tenant_id?: string): TvChannel[] List TV channels
---@field get_channel fun(channel_id: string): TvChannel|nil Get channel
---@field toggle_channel fun(channel_id: string): boolean, string? Start or stop channel
---@field get_schedule fun(channel_id: string, hours_ahead?: number): TvScheduleEntry[] Get schedule
---@field get_epg fun(hours_ahead?: number): table Get full EPG
---@field get_stream_url fun(channel_id: string, quality?: string): string|nil Get stream URL
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

---Get channel schedule
---@param channel_id string Channel ID
---@param hours_ahead? number Hours of programming (default 24)
---@return TvScheduleEntry[] entries Schedule entries
function M.get_schedule(channel_id, hours_ahead)
  if not channel_id or channel_id == "" then
    return {}
  end
  hours_ahead = hours_ahead or 24
  -- HTTP GET /api/tv/channels/:id/schedule?hours=N
  return {}
end

---Get full EPG for all channels
---@param hours_ahead? number Hours of programming (default 24)
---@return table epg EPG data by channel
function M.get_epg(hours_ahead)
  hours_ahead = hours_ahead or 24
  -- HTTP GET /api/tv/epg?hours=N
  return {}
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

---Format program duration
---@param duration_seconds number Duration in seconds
---@return string formatted Formatted duration (HH:MM or MM min)
function M.format_duration(duration_seconds)
  local hours = math.floor(duration_seconds / 3600)
  local minutes = math.floor((duration_seconds % 3600) / 60)
  
  if hours > 0 then
    return string.format("%d:%02d", hours, minutes)
  else
    return tostring(minutes) .. " min"
  end
end

---Format time for EPG display
---@param iso_timestamp string ISO timestamp
---@return string formatted Formatted time (HH:MM)
function M.format_epg_time(iso_timestamp)
  -- Would parse ISO timestamp and format
  return iso_timestamp
end

---Get category display name
---@param category string Category code
---@return string name Display name
function M.get_category_name(category)
  local names = {
    general = "General",
    news = "News",
    sports = "Sports",
    movies = "Movies",
    series = "Series",
    kids = "Kids",
    music = "Music",
    documentary = "Documentary",
    lifestyle = "Lifestyle",
    other = "Other"
  }
  return names[category] or category
end

---Get rating badge color
---@param rating string Content rating
---@return string color MUI color
function M.get_rating_color(rating)
  local colors = {
    ["G"] = "success",
    ["PG"] = "success",
    ["PG-13"] = "warning",
    ["R"] = "error",
    ["NC-17"] = "error",
    ["TV-Y"] = "success",
    ["TV-Y7"] = "success",
    ["TV-G"] = "success",
    ["TV-PG"] = "info",
    ["TV-14"] = "warning",
    ["TV-MA"] = "error",
    ["NR"] = "default"
  }
  return colors[rating] or "default"
end

---Get viewer count display text
---@param count number Viewer count
---@return string text Display text
function M.format_viewer_count(count)
  if count == 0 then
    return "No viewers"
  elseif count == 1 then
    return "1 viewer"
  elseif count >= 1000 then
    return string.format("%.1fK viewers", count / 1000)
  else
    return tostring(count) .. " viewers"
  end
end

return M
