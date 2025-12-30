-- Notification list container

---@class UIComponent
---@field type string
---@field children? table[]
---@field emptyMessage? string

---@param notifications? table[]
---@return UIComponent
local function list_container(notifications)
  return {
    type = "notification_list",
    children = notifications or {},
    emptyMessage = "No notifications"
  }
end

return list_container
