--- Stream scheduling facade
--- Re-exports single-function modules for backward compatibility

local M = {}

M.render_item = require("render_schedule_item")
M.render_list = require("render_schedule_list")
M.create = require("schedule_stream")
M.cancel = require("cancel_stream")

return M
