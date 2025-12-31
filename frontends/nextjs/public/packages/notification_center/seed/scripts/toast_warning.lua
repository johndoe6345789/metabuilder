--- Create a warning toast notification
---@param message string Toast message
---@param duration? number Display duration in ms (default 4000)
---@return Toast Toast configuration
local function toast_warning(message, duration)
  return {
    type = "toast",
    variant = "warning",
    message = message,
    duration = duration or 4000,
    icon = "warning"
  }
end

return toast_warning
