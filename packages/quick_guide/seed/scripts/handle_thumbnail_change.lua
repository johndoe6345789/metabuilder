local is_valid_url = require("is_valid_url")
local is_image_url = require("is_image_url")

--- Handle thumbnail URL change
---@param state MediaState Current state
---@param newUrl string New thumbnail URL
---@return MediaState Updated state
local function handle_thumbnail_change(state, newUrl)
  return {
    thumbnailUrl = newUrl,
    videoUrl = state.videoUrl,
    thumbnailValid = is_valid_url(newUrl),
    videoValid = state.videoValid,
    thumbnailIsImage = is_image_url(newUrl),
    videoIsVideo = state.videoIsVideo
  }
end

return handle_thumbnail_change
