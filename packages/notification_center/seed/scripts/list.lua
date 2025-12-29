-- Notification list utilities
local M = {}

function M.render_item(notification)
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

function M.render_list(notifications)
  local items = {}
  for _, n in ipairs(notifications) do
    table.insert(items, M.render_item(n))
  end
  return {
    type = "notification_list",
    children = items
  }
end

function M.render_badge(count)
  if count > 0 then
    return {
      type = "badge",
      content = count > 99 and "99+" or tostring(count),
      variant = "error"
    }
  end
  return nil
end

return M
