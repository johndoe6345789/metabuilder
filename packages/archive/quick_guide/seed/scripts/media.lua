-- Media pane logic for quick guides

---@class MediaState
---@field thumbnailUrl string Thumbnail URL
---@field videoUrl string Video URL
---@field thumbnailValid boolean Whether thumbnail URL is valid
---@field videoValid boolean Whether video URL is valid
---@field thumbnailIsImage boolean Whether thumbnail is an image URL
---@field videoIsVideo boolean Whether video is a video URL

---@class MediaProps
---@field thumbnailUrl? string Initial thumbnail URL
---@field videoUrl? string Initial video URL

---@class MediaModule
local M = {}

---Validate a URL (basic check)
---@param url? string URL to validate
---@return boolean Whether URL is valid
function M.isValidUrl(url)
  if not url or url == "" then
    return false
  end
  return string.match(url, "^https?://") ~= nil
end

---Check if URL is an image
---@param url? string URL to check
---@return boolean Whether URL points to an image
function M.isImageUrl(url)
  if not M.isValidUrl(url) then
    return false
  end
  local patterns = { "%.png$", "%.jpg$", "%.jpeg$", "%.gif$", "%.webp$", "%.svg$" }
  for _, pattern in ipairs(patterns) do
    if string.match(url:lower(), pattern) then
      return true
    end
  end
  return false
end

---Check if URL is a video embed
---@param url? string URL to check
---@return boolean Whether URL points to a video
function M.isVideoUrl(url)
  if not M.isValidUrl(url) then
    return false
  end
  local patterns = { "youtube%.com", "vimeo%.com", "%.mp4$", "%.webm$" }
  for _, pattern in ipairs(patterns) do
    if string.match(url:lower(), pattern) then
      return true
    end
  end
  return false
end

---Prepare media state from props
---@param props? MediaProps Input props
---@return MediaState Initial media state
function M.prepareMediaState(props)
  props = props or {}
  return {
    thumbnailUrl = props.thumbnailUrl or "",
    videoUrl = props.videoUrl or "",
    thumbnailValid = M.isValidUrl(props.thumbnailUrl),
    videoValid = M.isValidUrl(props.videoUrl),
    thumbnailIsImage = M.isImageUrl(props.thumbnailUrl),
    videoIsVideo = M.isVideoUrl(props.videoUrl)
  }
end

---Handle thumbnail URL change
---@param state MediaState Current state
---@param newUrl string New thumbnail URL
---@return MediaState Updated state
function M.handleThumbnailChange(state, newUrl)
  return {
    thumbnailUrl = newUrl,
    videoUrl = state.videoUrl,
    thumbnailValid = M.isValidUrl(newUrl),
    videoValid = state.videoValid,
    thumbnailIsImage = M.isImageUrl(newUrl),
    videoIsVideo = state.videoIsVideo
  }
end

---Handle video URL change
---@param state MediaState Current state
---@param newUrl string New video URL
---@return MediaState Updated state
function M.handleVideoChange(state, newUrl)
  return {
    thumbnailUrl = state.thumbnailUrl,
    videoUrl = newUrl,
    thumbnailValid = state.thumbnailValid,
    videoValid = M.isValidUrl(newUrl),
    thumbnailIsImage = state.thumbnailIsImage,
    videoIsVideo = M.isVideoUrl(newUrl)
  }
end

return M
