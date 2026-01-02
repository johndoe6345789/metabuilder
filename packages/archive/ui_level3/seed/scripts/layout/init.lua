---@class LayoutModule
---@field render fun(ctx: LayoutContext): UIComponent Main layout renderer
---@field stats fun(ctx: LayoutContext): UIComponent Stats grid creator
---@field tabs fun(): UIComponent Tabs interface creator
---@field admin_sidebar fun(items: table[]?): table Admin sidebar component creator
---@field admin_toolbar fun(actions: table[]?): table Admin toolbar component creator
---@field admin_content fun(children: table[]?): table Admin content area component creator

-- Level 3 layout module
local layout = {
  render = require("layout.render").render,
  stats = require("layout.stats").stats,
  tabs = require("layout.tabs").tabs,
  admin_sidebar = require("layout.admin_sidebar"),
  admin_toolbar = require("layout.admin_toolbar"),
  admin_content = require("layout.admin_content")
}

return layout
