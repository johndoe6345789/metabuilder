-- Info toast notification

---@class Toast
---@field type "toast" Component type identifier
---@field variant "info"|"success"|"warning"|"error" Toast variant type
---@field message string Toast message content
---@field duration number Display duration in milliseconds
---@field icon string Icon name

---Create an info toast notification
---@param message string Toast message content
---@param duration? number Display duration in milliseconds (default: 3000)
---@return Toast info The info toast notification
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
