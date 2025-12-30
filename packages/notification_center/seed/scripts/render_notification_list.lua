local render_notification_item = require("render_notification_item")

--- Render a list of notifications
---@param notifications Notification[] Array of notifications
---@return NotificationListComponent Notification list component
local function render_notification_list(notifications)
  local items = {}
  for _, n in ipairs(notifications) do
    table.insert(items, render_notification_item(n))
  end
  return {
    type = "notification_list",
    children = items
  }
end

return render_notification_list
