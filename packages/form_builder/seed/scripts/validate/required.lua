-- Form validation required rule
local function required(message)
  return {
    type = "required",
    message = message or "This field is required"
  }
end

return required
