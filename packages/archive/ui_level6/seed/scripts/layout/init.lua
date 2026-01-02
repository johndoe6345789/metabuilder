--- Level 6 layout module facade
--- Re-exports all supergod layout functions for backward compatibility
---@module layout.init

---@class Level6LayoutModule
---@field supergod_sidebar fun(): string Render supergod sidebar
---@field supergod_toolbar fun(): string Render supergod toolbar
---@field supergod_content fun(content: string): string Render supergod content area
local M = {}

M.supergod_sidebar = require("layout.supergod_sidebar")
M.supergod_toolbar = require("layout.supergod_toolbar")
M.supergod_content = require("layout.supergod_content")

return M
