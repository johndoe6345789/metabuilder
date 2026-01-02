--- Render player status bar
---@param state PlayerState Player state
---@param viewers number Number of viewers
---@return StatusBarComponent Status bar component
local function render_status(state, viewers)
  local colors = {
    playing = "success",
    paused = "warning",
    buffering = "info",
    offline = "error"
  }
  return {
    type = "status_bar",
    children = {
      { type = "badge", props = { label = state, color = colors[state] } },
      { type = "text", props = { text = viewers .. " viewers" } }
    }
  }
end

return render_status
