--- User list rendering facade
--- Re-exports user list functions for backward compatibility
---@module list

local get_columns = require("get_columns")
local render_row = require("render_row")
local render_users = require("render_users")

---@class ListModule
local M = {}

M.columns = get_columns
M.render_row = render_row
M.render = render_users

return M
