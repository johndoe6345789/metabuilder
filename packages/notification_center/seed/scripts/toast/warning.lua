-- Warning toast notification

---@class Toast
---@field type "toast" Component type identifier
---@field variant "info"|"success"|"warning"|"error" Toast variant type
---@field message string Toast message content
---@field duration number Display duration in milliseconds
---@field icon string Icon name

---Create a warning toast notification
---@param message string Toast message content
---@param duration? number Display duration in milliseconds (default: 4000)
---@return Toast warning The warning toast notification
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
