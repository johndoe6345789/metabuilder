-- Items tests for nav_menu package
-- Tests menu item builder functions

---@class MenuItemCase
---@field label string
---@field path string
---@field icon string|nil
---@field desc string

---@class MenuGroupCase
---@field label string
---@field children table|nil
---@field icon string|nil
---@field desc string

---@class ItemsCases
---@field menu_item MenuItemCase[]
---@field menu_group MenuGroupCase[]

local menu_item = require("items/item")
local menu_group = require("items/group")
local menu_divider = require("items/divider")
---@type ItemsCases
local cases = load_cases("items.cases.json")

describe("Menu Item Builders", function()
  describe("menu_item", function()
    it.each(cases.menu_item, "$desc", function(testCase)
      ---@type MenuItemCase
      local tc = testCase
      local result = menu_item(tc.label, tc.path, tc.icon)
      expect(result.type).toBe("menu_item")
      expect(result.label).toBe(tc.label)
      expect(result.path).toBe(tc.path)
      if tc.icon then
        expect(result.icon).toBe(tc.icon)
      end
    end)
  end)

  describe("menu_group", function()
    it.each(cases.menu_group, "$desc", function(testCase)
      ---@type MenuGroupCase
      local tc = testCase
      local result = menu_group(tc.label, tc.children, tc.icon)
      expect(result.type).toBe("menu_group")
      expect(result.label).toBe(tc.label)
      expect(result.children).toBeType("table")
    end)

    it("should include children in group", function()
      local children = {
        menu_item("Profile", "/profile"),
        menu_item("Security", "/security")
      }
      local result = menu_group("Settings", children, "gear")
      expect(#result.children).toBe(2)
      expect(result.children[1].label).toBe("Profile")
    end)
  end)

  describe("menu_divider", function()
    it("should create divider", function()
      local result = menu_divider()
      expect(result.type).toBe("divider")
    end)
  end)
end)
