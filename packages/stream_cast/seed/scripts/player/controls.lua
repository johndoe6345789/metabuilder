--- Stream player controls configuration
---@param show_play? boolean Show play button (default true)
---@param show_volume? boolean Show volume slider (default true)
---@param show_fullscreen? boolean Show fullscreen button (default true)
---@return PlayerControlsConfig Controls configuration
local function controls(show_play, show_volume, show_fullscreen)
  return {
    type = "player_controls",
    showPlay = show_play ~= false,
    showVolume = show_volume ~= false,
    showFullscreen = show_fullscreen ~= false
  }
end

return controls
