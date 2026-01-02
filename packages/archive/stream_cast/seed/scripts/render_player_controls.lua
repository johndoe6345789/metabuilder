--- Render player controls
---@param state PlayerState Current player state
---@return PlayerControlsComponent Player controls component
local function render_controls(state)
  local PLAYING = "playing"
  return {
    type = "player_controls",
    children = {
      { type = "button", props = { icon = state == PLAYING and "pause" or "play" } },
      { type = "volume_slider", props = { min = 0, max = 100 } },
      { type = "button", props = { icon = "maximize" } }
    }
  }
end

return render_controls
