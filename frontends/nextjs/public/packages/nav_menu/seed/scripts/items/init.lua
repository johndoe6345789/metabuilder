-- Nav menu items module

---@class MenuItemsModule
---@field item fun(label: string, path: string, icon?: string): MenuItemData
---@field group fun(label: string, children?: table, icon?: string): MenuGroup
---@field divider fun(): MenuDivider
local items = {
  item = require("items.item"),
  group = require("items.group"),
  divider = require("items.divider")
}

return items
