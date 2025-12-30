-- Toast notifications module

---@class Toast
---@field type string
---@field variant "info"|"success"|"warning"|"error"
---@field message string
---@field duration number
---@field icon string

---@class ToastModule
---@field success fun(message: string, duration?: number): Toast
---@field error fun(message: string, duration?: number): Toast
---@field warning fun(message: string, duration?: number): Toast
---@field info fun(message: string, duration?: number): Toast
local toast = {
  success = require("toast.success"),
  error = require("toast.error"),
  warning = require("toast.warning"),
  info = require("toast.info")
}

return toast
