--- Stream player overlay component
---@param title string Overlay title
---@param subtitle string Overlay subtitle
---@return PlayerOverlayComponent Overlay component
local function overlay(title, subtitle)
  return {
    type = "player_overlay",
    title = title,
    subtitle = subtitle
  }
end

return overlay
