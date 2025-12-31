local is_valid_url = require("is_valid_url")

--- Check if URL is a video embed
---@param url? string URL to check
---@return boolean Whether URL points to a video
local function is_video_url(url)
  if not is_valid_url(url) then
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

return is_video_url
