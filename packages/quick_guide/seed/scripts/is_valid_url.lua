--- Validate a URL (basic check)
---@param url? string URL to validate
---@return boolean Whether URL is valid
local function is_valid_url(url)
  if not url or url == "" then
    return false
  end
  return string.match(url, "^https?://") ~= nil
end

return is_valid_url
