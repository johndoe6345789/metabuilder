-- Items tests for nav_menu package
-- Tests menu item builder functions

local menu_item = require("items/item")
local menu_group = require("items/group")
local menu_divider = require("items/divider")

describe("Menu Item Builders", function()
  describe("menu_item", function()
    it.each({
      { label = "Home", path = "/", icon = nil, desc = "without icon" },
      { label = "Settings", path = "/settings", icon = "gear", desc = "with icon" },
    })("should create item $desc", function(testCase)
      local result = menu_item(testCase.label, testCase.path, testCase.icon)
      expect(result.type).toBe("menu_item")
      expect(result.label).toBe(testCase.label)
      expect(result.path).toBe(testCase.path)
      if testCase.icon then
        expect(result.icon).toBe(testCase.icon)
      end
    end)
  end)

  describe("menu_group", function()
    it.each({
      { label = "Admin", children = nil, icon = nil, desc = "empty group" },
      { label = "Settings", children = {}, icon = "gear", desc = "empty children array" },
    })("should create group $desc", function(testCase)
      local result = menu_group(testCase.label, testCase.children, testCase.icon)
      expect(result.type).toBe("menu_group")
      expect(result.label).toBe(testCase.label)
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
