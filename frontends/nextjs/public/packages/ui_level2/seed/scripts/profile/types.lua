-- Type definitions for profile module

---@class UIComponent
---@field type string Component type name
---@field props? table<string, any> Component properties
---@field children? UIComponent[] Child components

---@class UserInfo
---@field username string User's display name
---@field email? string User's email address

---@class RenderContext
---@field user UserInfo Current user information

---@class InputProps
---@field label string
---@field value string
---@field name? string
---@field disabled? boolean

---@class ButtonProps
---@field text string
---@field onClick string
---@field variant? string

---@class IconProps
---@field name string
---@field size? "small"|"medium"|"large"|"inherit"
---@field className? string

---@class FormData
---@field email string Email from form input

---@class ProfileResponse
---@field success boolean Whether operation succeeded
---@field action string Action type identifier
---@field email string Updated email value

return {}
