-- Stream player controls
local function controls(show_play, show_volume, show_fullscreen)
  return {
    type = "player_controls",
    showPlay = show_play ~= false,
    showVolume = show_volume ~= false,
    showFullscreen = show_fullscreen ~= false
  }
end

return controls
