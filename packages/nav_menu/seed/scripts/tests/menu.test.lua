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

---@class MenuRenderTestCase
---@field props MenuRenderProps
---@field expectedChildren integer
---@field desc string

describe("Menu", function()
  -- Mock check module
  ---@type { can_show: MenuShowTestCase[], render: MenuRenderTestCase[] }
  local cases = load_cases("menu.cases.json")
  
  before(function()
    -- Create mock for check.can_access
    package.loaded["check"] = {
      can_access = function(user, minLevel)
        return (user.level or 0) >= minLevel
      end
    }
  end)

  local menu = require("menu")

  describe("can_show", function()
    it.each(cases.can_show, "$desc", function(testCase)
      local result = menu.can_show(testCase.user, testCase.item)
      expect(result).toBe(testCase.expected)
    end)
  end)

  describe("item", function()
    it("should render button for simple item", function()
      local result = menu.item({ label = "Home", path = "/" })
      expect(result.type).toBe("Button")
      expect(result.props.text).toBe("Home")
      expect(result.props.variant).toBe("ghost")
    end)

    it("should render dropdown for item with children", function()
      local result = menu.item({
        label = "Settings",
        children = {
          { label = "Profile", path = "/profile" },
          { label = "Security", path = "/security" }
        }
      })
      expect(result.type).toBe("DropdownMenu")
      expect(#result.children).toBe(2)
    end)
  end)

  describe("render", function()
    it.each(cases.render, "$desc", function(testCase)
      local result = menu.render(testCase.props)
      expect(result.type).toBe("Flex")
      expect(#result.children).toBe(testCase.expectedChildren)
    end)
  end)
end)
