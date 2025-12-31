-- Notification list module

---@class NotificationListModule
---@field item fun(id: string|number, title: string, message: string, timestamp: string|number, read?: boolean): UIComponent
---@field container fun(notifications?: table[]): UIComponent
local list = {
  item = require("list.item"),
  container = require("list.container")
}

return list
