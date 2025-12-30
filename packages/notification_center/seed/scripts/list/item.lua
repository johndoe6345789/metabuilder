-- Notification list item component
local function list_item(id, title, message, timestamp, read)
  return {
    type = "notification_item",
    id = id,
    title = title,
    message = message,
    timestamp = timestamp,
    read = read or false
  }
end

return list_item
