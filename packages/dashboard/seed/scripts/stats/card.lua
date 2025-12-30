-- Dashboard stat card component

---@class StatCardConfig
---@field type string
---@field title string
---@field value string|number
---@field icon? string
---@field trend? table

---@param title string Card title
---@param value string|number Card value to display
---@param icon? string Optional icon identifier
---@param trend? table Optional trend indicator data
---@return StatCardConfig
local function stat_card(title, value, icon, trend)
  return {
    type = "stat_card",
    title = title,
    value = value,
    icon = icon,
    trend = trend
  }
end

return stat_card
