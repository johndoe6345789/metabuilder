-- Notification list item component

---@class UIComponent
---@field type string
---@field id string|number
---@field title string
---@field message string
---@field timestamp string|number
---@field read boolean

---@param id string|number
---@param title string
---@param message string
---@param timestamp string|number
---@param read? boolean
---@return UIComponent
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
