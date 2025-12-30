--- Render video player component
---@param stream Stream Stream data
---@return VideoPlayerComponent Video player component
local function render_player(stream)
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

return render_player
