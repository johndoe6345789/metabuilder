-- Moderation module facade
-- Re-exports all moderation functions for backward compatibility
-- Each function is defined in its own file following 1-function-per-file pattern

---@class Moderation
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
