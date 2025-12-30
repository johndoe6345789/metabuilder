-- Form validation max length rule
local function max_length(length, message)
  return {
    type = "maxLength",
    value = length,
    message = message or ("Maximum " .. length .. " characters allowed")
  }
end

return max_length
