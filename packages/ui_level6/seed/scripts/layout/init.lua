-- Level 6 layout module facade
-- Re-exports all supergod layout functions for backward compatibility

local M = {}

M.supergod_sidebar = require("layout.supergod_sidebar")
M.supergod_toolbar = require("layout.supergod_toolbar")
M.supergod_content = require("layout.supergod_content")

return M
