--- Notification list facade
--- Re-exports single-function modules for backward compatibility

local M = {}

M.render_item = require("render_notification_item")
M.render_list = require("render_notification_list")
M.render_badge = require("render_notification_badge")

return M
