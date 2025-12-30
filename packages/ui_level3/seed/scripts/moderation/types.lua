-- Type definitions for moderation module
-- Shared across all moderation functions

---@class ModerationContext
---@field user table User object for permission checking
---@field targetId string ID of the target user for moderation action

---@class ActionResult
---@field success boolean Whether the action was successful
---@field error string? Error message if unsuccessful
---@field action string? Action type to perform
---@field id string? ID of the affected user

return {}
