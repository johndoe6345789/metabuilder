--- Notification list facade
--- Re-exports single-function modules for backward compatibility

---@class NotificationListModule
---@field render_item fun(notification: Notification): NotificationItemComponent
---@field render_list fun(notifications: Notification[]): NotificationListComponent
---@field render_badge fun(count: number): BadgeComponent|nil

---@type NotificationListModule
local M = {}

M.render_item = require("render_notification_item")
M.render_list = require("render_notification_list")
M.render_badge = require("render_notification_badge")

return M
