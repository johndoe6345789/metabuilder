-- Media pane logic for quick guides
local M = {}

-- Validate a URL (basic check)
function M.isValidUrl(url)
  if not url or url == "" then
    return false
  end
  return string.match(url, "^https?://") ~= nil
end

-- Check if URL is an image
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

-- Check if URL is a video embed
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

-- Prepare media state
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

-- Handle thumbnail change
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

-- Handle video change
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
