--- Notification Center package entry point
--- Provides notification list, toast, and summary components
---@class NotificationCenterPackage
---@field name string Package name
---@field version string Package version
---@field list NotificationListModule List rendering
---@field toast ToastModule Toast utilities
---@field summary SummaryModule Summary utilities
---@field init fun(): NotificationCenterInfo

---@class NotificationListModule
---@field render_item fun(notification: Notification): NotificationItemComponent
---@field render_list fun(notifications: Notification[]): NotificationListComponent
---@field render_badge fun(count: number): BadgeComponent|nil

---@class ToastModule
---@field success fun(message: string, duration?: number): Toast
---@field error fun(message: string, duration?: number): Toast
---@field warning fun(message: string, duration?: number): Toast
---@field info fun(message: string, duration?: number): Toast

---@class SummaryModule
---@field calculateTotal fun(items: SummaryItem[]): number
---@field getSeverityClass fun(severity?: NotificationSeverity): string
---@field prepareSummary fun(props: SummaryProps): SummaryData

---@class NotificationCenterInfo
---@field name string
---@field version string
---@field loaded boolean

local M = {}

M.name = "notification_center"
M.version = "1.0.0"

-- Load sub-modules
M.list = require("list")
M.toast = require("toast")
M.summary = require("summary")

---@return NotificationCenterInfo
function M.init()
  return {
    name = M.name,
    version = M.version,
    loaded = true
  }
end

return M
