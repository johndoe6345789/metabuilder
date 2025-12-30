-- Notification list container
local function list_container(notifications)
  return {
    type = "notification_list",
    children = notifications or {},
    emptyMessage = "No notifications"
  }
end

return list_container
