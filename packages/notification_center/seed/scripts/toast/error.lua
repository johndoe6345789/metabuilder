-- Error toast notification
local function error(message, duration)
  return {
    type = "toast",
    variant = "error",
    message = message,
    duration = duration or 5000,
    icon = "error"
  }
end

return error
