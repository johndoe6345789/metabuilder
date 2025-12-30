-- Navigation module facade
-- Re-exports all navigation functions for backward compatibility

local to_level2 = require("navigate.to_level2")
local to_level3 = require("navigate.to_level3")
local open_docs = require("navigate.open_docs")

---@class NavigateModule
---@field toLevel2 fun(ctx: Context): NavigationResult
---@field toLevel3 fun(ctx: Context): NavigationResult
---@field openDocs fun(): NavigationResult
local M = {}

M.toLevel2 = to_level2.toLevel2
M.toLevel3 = to_level3.toLevel3
M.openDocs = open_docs.openDocs

return M
