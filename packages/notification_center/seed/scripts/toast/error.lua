-- Error toast notification

---@class Toast
---@field type string
---@field variant "info"|"success"|"warning"|"error"
---@field message string
---@field duration number
---@field icon string

---@param message string
---@param duration? number
---@return Toast
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
