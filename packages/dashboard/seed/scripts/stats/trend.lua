-- Dashboard stat trend indicator

---@class TrendIndicatorConfig
---@field type string
---@field direction string
---@field value string
---@field color string

---@param direction string Direction of trend: "up" or "down"
---@param value string Trend value to display
---@return TrendIndicatorConfig
local function trend_indicator(direction, value)
  return {
    type = "trend",
    direction = direction, -- "up" or "down"
    value = value,
    color = direction == "up" and "success" or "error"
  }
end

return trend_indicator
