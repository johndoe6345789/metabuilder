-- Type definitions for moderation module
-- Shared across all moderation functions

---@class ModerationUser
---@field id string
---@field level? number

---@class ModerationContext
---@field user ModerationUser User object for permission checking
---@field targetId string ID of the target user for moderation action

---@alias ModerationAction "delete_user"|"ban_user"|"open_edit_dialog"

---@class ActionResult
---@field success boolean Whether the action was successful
---@field error string? Error message if unsuccessful
---@field action ModerationAction? Action type to perform
---@field id string? ID of the affected user

return {}
