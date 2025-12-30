local is_valid_url = require("is_valid_url")
local is_image_url = require("is_image_url")
local is_video_url = require("is_video_url")

--- Prepare media state from props
---@param props? MediaProps Input props
---@return MediaState Initial media state
local function prepare_media_state(props)
  props = props or {}
  return {
    thumbnailUrl = props.thumbnailUrl or "",
    videoUrl = props.videoUrl or "",
    thumbnailValid = is_valid_url(props.thumbnailUrl),
    videoValid = is_valid_url(props.videoUrl),
    thumbnailIsImage = is_image_url(props.thumbnailUrl),
    videoIsVideo = is_video_url(props.videoUrl)
  }
end

return prepare_media_state
