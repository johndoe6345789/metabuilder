-- Dashboard stat card component
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
