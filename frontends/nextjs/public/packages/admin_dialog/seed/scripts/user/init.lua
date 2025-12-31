-- User dialog module facade
-- Re-exports all user dialog functions for backward compatibility
-- Each function is defined in its own file following 1-function-per-file pattern

---@class UserDialog
local M = {}

-- Import all single-function modules
local renderCreate = require("user.render_create")
local renderEdit = require("user.render_edit")

-- Re-export all functions
M.render_create = renderCreate.render_create
M.render_edit = renderEdit.render_edit

return M
