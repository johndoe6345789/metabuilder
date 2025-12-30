-- Warning toast notification

---@class Toast
---@field type string
---@field variant "info"|"success"|"warning"|"error"
---@field message string
---@field duration number
---@field icon string

---@param message string
---@param duration? number
---@return Toast
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
