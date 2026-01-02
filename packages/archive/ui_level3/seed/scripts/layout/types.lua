-- Type definitions for Level 3 layout module

---@class LayoutContext
---@field user table User object with username and id
---@field userCount integer Number of users
---@field commentCount integer Number of comments
---@field flaggedCount integer Number of flagged items

---@class UIComponent
---@field type string Component type name
---@field props table? Component properties
---@field children table[]? Child components

return {}
