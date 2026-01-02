-- Level 5 layout module

---@class LayoutComponentFunction
---@field supergod_sidebar fun(items?: table[]): table
---@field supergod_toolbar fun(actions?: table[]): table
---@field supergod_content fun(children?: table[]): table

---@type LayoutComponentFunction
local layout = {
  supergod_sidebar = require("layout.supergod_sidebar"),
  supergod_toolbar = require("layout.supergod_toolbar"),
  supergod_content = require("layout.supergod_content")
}

return layout
