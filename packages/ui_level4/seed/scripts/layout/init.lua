-- Level 4 layout module
-- Aggregates layout component modules for the Level 4 UI

---@alias GodSidebarFn fun(items?: table[]): table
---@alias GodToolbarFn fun(actions?: table[]): table
---@alias GodContentFn fun(children?: table[]): table

---@class LayoutModule
---@field god_sidebar GodSidebarFn
---@field god_toolbar GodToolbarFn
---@field god_content GodContentFn

---@type LayoutModule
local layout = {
  god_sidebar = require("layout.god_sidebar"),
  god_toolbar = require("layout.god_toolbar"),
  god_content = require("layout.god_content")
}

return layout
