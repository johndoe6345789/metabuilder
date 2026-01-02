local is_valid_url = require("is_valid_url")
local is_video_url = require("is_video_url")

--- Handle video URL change
---@param state MediaState Current state
---@param newUrl string New video URL
---@return MediaState Updated state
local function handle_video_change(state, newUrl)
  return {
    thumbnailUrl = state.thumbnailUrl,
    videoUrl = newUrl,
    thumbnailValid = state.thumbnailValid,
    videoValid = is_valid_url(newUrl),
    thumbnailIsImage = state.thumbnailIsImage,
    videoIsVideo = is_video_url(newUrl)
  }
end

return handle_video_change
