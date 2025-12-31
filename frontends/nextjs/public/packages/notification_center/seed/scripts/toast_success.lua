--- Create a success toast notification
---@param message string Toast message
---@param duration? number Display duration in ms (default 3000)
---@return Toast Toast configuration
local function toast_success(message, duration)
  return {
    type = "toast",
    variant = "success",
    message = message,
    duration = duration or 3000,
    icon = "check"
  }
end

return toast_success
