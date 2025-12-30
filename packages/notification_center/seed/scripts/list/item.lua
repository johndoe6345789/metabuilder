-- Notification list item component

---@class ListItem : UIComponent
---@field type "notification_item" Component type identifier
---@field id string|number Unique notification identifier
---@field title string Notification title
---@field message string Notification message content
---@field timestamp string|number Notification timestamp
---@field read boolean Read status

---@class UIComponent
---@field type string Component type identifier

---Create a notification list item component
---@param id string|number Unique notification identifier
---@param title string Notification title
---@param message string Notification message content
---@param timestamp string|number Notification timestamp
---@param read? boolean Read status (default: false)
---@return ListItem list_item The list item component
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
