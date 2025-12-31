local is_valid_url = require("is_valid_url")

--- Check if URL is an image
---@param url? string URL to check
---@return boolean Whether URL points to an image
local function is_image_url(url)
  if not is_valid_url(url) then
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

return is_image_url
