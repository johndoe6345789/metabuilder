-- Menu tests for nav_menu package
-- Tests menu rendering and permission filtering

---@class MenuUser
---@field level? number

---@class MenuItem
---@field label string
---@field path? string
---@field minLevel? number
---@field children? MenuItem[]

---@class MenuRenderProps
---@field user MenuUser
---@field items MenuItem[]

---@class MenuShowTestCase
---@field user MenuUser
---@field item MenuItem
---@field expected boolean
---@field desc string

---@class MenuItemRenderTestCase
---@field item MenuItem
---@field expectedType string
---@field expectedText? string
---@field expectedVariant? string
---@field expectedChildren? integer
---@field desc string

---@class MenuRenderTestCase
---@field props MenuRenderProps
---@field expectedChildren integer
---@field desc string

---@class MenuCases
---@field can_show MenuShowTestCase[]
---@field item MenuItemRenderTestCase[]
---@field render MenuRenderTestCase[]

describe("Menu", function()
  -- Mock check module
  ---@type MenuCases
  local cases = load_cases("menu.cases.json")
  local it_each = require("lua_test.it_each")
  
  beforeAll(function()
    -- Create mock for check.can_access
    package.loaded["check"] = {
      can_access = function(user, minLevel)
        return (user.level or 0) >= minLevel
      end
    }
  end)

  local menu = require("menu")

  describe("can_show", function()
    it_each(cases.can_show, "$desc", function(testCase)
      ---@type MenuShowTestCase
      local tc = testCase
      local result = menu.can_show(tc.user, tc.item)
      expect(result).toBe(tc.expected)
    end)
  end)

  describe("item", function()
    it_each(cases.item, "$desc", function(testCase)
      ---@type MenuItemRenderTestCase
      local tc = testCase
      local result = menu.item(tc.item)
      expect(result.type).toBe(tc.expectedType)
      if tc.expectedText then
        expect(result.props.text).toBe(tc.expectedText)
      end
      if tc.expectedVariant then
        expect(result.props.variant).toBe(tc.expectedVariant)
      end
      if tc.expectedChildren then
        expect(#result.children).toBe(tc.expectedChildren)
      end
    end)
  end)

  describe("render", function()
    it_each(cases.render, "$desc", function(testCase)
      ---@type MenuRenderTestCase
      local tc = testCase
      local result = menu.render(tc.props)
      expect(result.type).toBe("Flex")
      expect(#result.children).toBe(tc.expectedChildren)
    end)
  end)
end)
