--- User management actions facade
--- Re-exports user action functions for backward compatibility
---@module actions

local create_user = require("create_user")
local update_user = require("update_user")
local delete_user = require("delete_user")
local change_level = require("change_level")
local toggle_active = require("toggle_active")

---@class ActionsModule
local M = {}

M.create = create_user
M.update = update_user
M.delete = delete_user
M.change_level = change_level
M.toggle_active = toggle_active

return M
