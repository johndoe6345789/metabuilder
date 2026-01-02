--- Render a notification item component
---@param notification Notification Notification data
---@return NotificationItemComponent Notification item component
local function render_notification_item(notification)
  return {
    type = "notification_item",
    props = {
      id = notification.id,
      title = notification.title,
      message = notification.message,
      time = notification.created_at,
      read = notification.read or false,
      icon = notification.icon or "bell"
    }
  }
end

return render_notification_item
