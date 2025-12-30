-- Dashboard stat trend indicator
local function trend_indicator(direction, value)
  return {
    type = "trend",
    direction = direction, -- "up" or "down"
    value = value,
    color = direction == "up" and "success" or "error"
  }
end

return trend_indicator
