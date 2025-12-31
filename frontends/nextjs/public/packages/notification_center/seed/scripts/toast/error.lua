-- Error toast notification

---@class Toast
---@field type "toast" Component type identifier
---@field variant "info"|"success"|"warning"|"error" Toast variant type
---@field message string Toast message content
---@field duration number Display duration in milliseconds
---@field icon string Icon name

---Create an error toast notification
---@param message string Toast message content
---@param duration? number Display duration in milliseconds (default: 5000)
---@return Toast error The error toast notification
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
