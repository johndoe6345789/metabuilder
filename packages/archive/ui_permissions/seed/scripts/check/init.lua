-- Permission checking module facade
-- Re-exports all check functions for backward compatibility
-- Each function is defined in its own file following 1-function-per-file pattern

---@class Check
local M = {}

-- Import all single-function modules
local getLevel = require("check.get_level")
local canAccess = require("check.can_access")
local isModeratorOrAbove = require("check.is_moderator_or_above")
local isAdminOrAbove = require("check.is_admin_or_above")

-- Re-export all functions
M.get_level = getLevel.get_level
M.can_access = canAccess.can_access
M.is_moderator_or_above = isModeratorOrAbove.is_moderator_or_above
M.is_admin_or_above = isAdminOrAbove.is_admin_or_above

return M
