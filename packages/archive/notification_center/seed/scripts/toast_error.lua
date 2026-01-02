--- Create an error toast notification
---@param message string Toast message
---@param duration? number Display duration in ms (default 5000)
---@return Toast Toast configuration
local function toast_error(message, duration)
  return {
    type = "toast",
    variant = "error",
    message = message,
    duration = duration or 5000,
    icon = "error"
  }
end

return toast_error
