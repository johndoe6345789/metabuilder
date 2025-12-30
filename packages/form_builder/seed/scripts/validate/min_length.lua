-- Form validation min length rule
local function min_length(length, message)
  return {
    type = "minLength",
    value = length,
    message = message or ("Minimum " .. length .. " characters required")
  }
end

return min_length
