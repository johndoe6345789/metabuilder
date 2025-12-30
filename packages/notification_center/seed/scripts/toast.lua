-- Toast notification utilities

---@class ToastUtils
local M = {}

---@class Toast
---@field type string
---@field variant "info"|"success"|"warning"|"error"
---@field message string
---@field duration number
---@field icon string

---@param message string
---@param duration? number
---@return Toast
function M.success(message, duration)
  return {
    type = "toast",
    variant = "success",
    message = message,
    duration = duration or 3000,
    icon = "check"
  }
end

---@param message string
---@param duration? number
---@return Toast
function M.error(message, duration)
  return {
    type = "toast",
    variant = "error",
    message = message,
    duration = duration or 5000,
    icon = "error"
  }
end

---@param message string
---@param duration? number
---@return Toast
function M.warning(message, duration)
  return {
    type = "toast",
    variant = "warning",
    message = message,
    duration = duration or 4000,
    icon = "warning"
  }
end

---@param message string
---@param duration? number
---@return Toast
function M.info(message, duration)
  return {
    type = "toast",
    variant = "info",
    message = message,
    duration = duration or 3000,
    icon = "info"
  }
end

return M
