-- Type definitions for auth gate module

---@class User
---@field id string User identifier
---@field level? number User permission level

---@class GateContext
---@field user? User Current user or nil
---@field requiredLevel? number Minimum level required
---@field children? table Child components to render if allowed

---@class CheckResult
---@field allowed boolean Whether access is allowed
---@field reason? string Reason for denial
---@field redirect? string URL to redirect to

---@class UIComponent
---@field type string Component type name
---@field props? table Component properties

return {}
