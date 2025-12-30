--[[
  TV data formatting utilities
]]

---@class TvFormattingModule
local M = {}

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
