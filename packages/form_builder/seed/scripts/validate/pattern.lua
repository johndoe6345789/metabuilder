-- Form validation pattern rule
local function pattern(regex, message)
  return {
    type = "pattern",
    value = regex,
    message = message or "Invalid format"
  }
end

return pattern
