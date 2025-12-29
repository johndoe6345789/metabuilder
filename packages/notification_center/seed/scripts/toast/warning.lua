-- Warning toast notification
local function warning(message, duration)
  return {
    type = "toast",
    variant = "warning",
    message = message,
    duration = duration or 4000,
    icon = "warning"
  }
end

return warning
