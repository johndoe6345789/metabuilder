--- Toast notification facade
--- Re-exports single-function modules for backward compatibility

---@class ToastModule Toast notification functions
---@field success fun(message: string, options?: ToastOptions): ToastConfig Create success toast
---@field error fun(message: string, options?: ToastOptions): ToastConfig Create error toast
---@field warning fun(message: string, options?: ToastOptions): ToastConfig Create warning toast
---@field info fun(message: string, options?: ToastOptions): ToastConfig Create info toast
local M = {}

M.success = require("toast_success")
M.error = require("toast_error")
M.warning = require("toast_warning")
M.info = require("toast_info")

return M
