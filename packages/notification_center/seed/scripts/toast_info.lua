--- Create an info toast notification
---@param message string Toast message
---@param duration? number Display duration in ms (default 3000)
---@return Toast Toast configuration
local function toast_info(message, duration)
  return {
    type = "toast",
    variant = "info",
    message = message,
    duration = duration or 3000,
    icon = "info"
  }
end

return toast_info
