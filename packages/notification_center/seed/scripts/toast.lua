--- Toast notification facade
--- Re-exports single-function modules for backward compatibility

local M = {}

M.success = require("toast_success")
M.error = require("toast_error")
M.warning = require("toast_warning")
M.info = require("toast_info")

return M
