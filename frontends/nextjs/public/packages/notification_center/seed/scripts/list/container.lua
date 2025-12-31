-- Notification list container

---@class ListContainer : UIComponent
---@field type "notification_list" Component type identifier
---@field children UIComponent[] Array of notification items
---@field emptyMessage string Message to display when list is empty

---@class UIComponent
---@field type string Component type identifier
---@field children? UIComponent[] Child components
---@field emptyMessage? string Empty state message

---Create a notification list container component
---@param notifications? UIComponent[] Array of notification items (default: {})
---@return ListContainer list_container The list container component
local function list_container(notifications)
  return {
    type = "notification_list",
    children = notifications or {},
    emptyMessage = "No notifications"
  }
end

return list_container
