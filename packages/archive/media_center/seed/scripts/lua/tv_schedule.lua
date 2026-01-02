--[[
  TV schedule and EPG operations
]]

---@class TvScheduleModule
local M = {}

local config = {
  base_url = "http://localhost:8090"
}

---Configure the helper
---@param opts table Configuration options
function M.configure(opts)
  if opts.base_url then config.base_url = opts.base_url end
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

return M
