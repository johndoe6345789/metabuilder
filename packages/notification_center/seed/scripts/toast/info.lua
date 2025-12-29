-- Info toast notification
local function info(message, duration)
  return {
    type = "toast",
    variant = "info",
    message = message,
    duration = duration or 3000,
    icon = "info"
  }
end

return info
