-- Success toast notification
local function success(message, duration)
  return {
    type = "toast",
    variant = "success",
    message = message,
    duration = duration or 3000,
    icon = "check"
  }
end

return success
