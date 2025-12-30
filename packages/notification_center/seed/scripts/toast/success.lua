-- Success toast notification

---@class Toast
---@field type string
---@field variant "info"|"success"|"warning"|"error"
---@field message string
---@field duration number
---@field icon string

---@param message string
---@param duration? number
---@return Toast
local function success(message, duration)
  return {
    type = "toast",
    variant = "success",
    message = message,
    duration = duration or 3000,
    icon = "check"
  }
end

return success
