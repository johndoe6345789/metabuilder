-- Stream player overlay
local function overlay(title, subtitle)
  return {
    type = "player_overlay",
    title = title,
    subtitle = subtitle
  }
end

return overlay
