-- Stream player controls
local M = {}

M.PLAYING = "playing"
M.PAUSED = "paused"
M.BUFFERING = "buffering"
M.OFFLINE = "offline"

function M.render(stream)
  return {
    type = "video_player",
    props = {
      src = stream.url,
      poster = stream.thumbnail,
      autoplay = true,
      controls = true
    }
  }
end

function M.render_controls(state)
  return {
    type = "player_controls",
    children = {
      { type = "button", props = { icon = state == M.PLAYING and "pause" or "play" } },
      { type = "volume_slider", props = { min = 0, max = 100 } },
      { type = "button", props = { icon = "maximize" } }
    }
  }
end

function M.render_status(state, viewers)
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

return M
