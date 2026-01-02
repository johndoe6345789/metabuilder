-- Format timestamp for display

---@class FormatTimestamp
local M = {}

---Format a timestamp (in milliseconds) for display
---@param timestamp number? Unix timestamp in milliseconds
---@return string Formatted date/time string or "Unknown"
function M.formatTimestamp(timestamp)
  if not timestamp then
    return "Unknown"
  end

  -- Assuming timestamp is in milliseconds
  local seconds = math.floor(timestamp / 1000)
  return os.date("%Y-%m-%d %H:%M:%S", seconds)
end

return M
