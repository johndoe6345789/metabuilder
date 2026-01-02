-- Sidebar module

---@class SidebarModule
---@field render fun(props: SidebarProps): UIComponent
---@field header fun(props: SidebarProps): UIComponent
---@field item fun(item: SidebarItem, currentPath: string?): UIComponent

local M = {
  render = require("sidebar.render").render,
  header = require("sidebar.header").header,
  item = require("sidebar.item").item
}

return M
