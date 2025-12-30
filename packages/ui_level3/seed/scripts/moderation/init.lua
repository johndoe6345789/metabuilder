-- Moderation module facade
-- Re-exports all moderation functions for backward compatibility
-- Each function is defined in its own file following 1-function-per-file pattern

---@class ModerationUpdates
---@field username? string
---@field email? string
---@field role? string
---@field level? number
---@field status? string

---@class Moderation
---@field deleteUser fun(userId: string): boolean
---@field editUser fun(userId: string, updates: ModerationUpdates): boolean
---@field banUser fun(userId: string, reason: string): boolean
local M = {}

-- Import all single-function modules
local deleteUser = require("moderation.delete_user")
local editUser = require("moderation.edit_user")
local banUser = require("moderation.ban_user")

-- Re-export all functions
M.deleteUser = deleteUser.deleteUser
M.editUser = editUser.editUser
M.banUser = banUser.banUser

return M
