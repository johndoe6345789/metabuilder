-- Sidebar tests for nav_menu package
-- Tests sidebar rendering and active state

---@class SidebarRenderCase
---@field props table
---@field expectedChildren integer
---@field desc string

---@class SidebarDefaultTitleCase
---@field props table
---@field expectedTitle string
---@field desc string

---@class SidebarHeaderCase
---@field props table
---@field expected string
---@field desc string

---@class SidebarItemCase
---@field item table
---@field currentPath string|nil
---@field expectedVariant string
---@field desc string

---@class SidebarCases
---@field render SidebarRenderCase[]
---@field render_default_title SidebarDefaultTitleCase[]
---@field header SidebarHeaderCase[]
---@field item SidebarItemCase[]

local sidebar = require("sidebar")
---@type SidebarCases
local cases = load_cases("sidebar.cases.json")

describe("Sidebar", function()
  describe("render", function()
    it.each(cases.render, "$desc", function(testCase)
      ---@type SidebarRenderCase
      local tc = testCase
      local result = sidebar.render(tc.props)
      expect(result.type).toBe("Box")
      expect(#result.children).toBe(tc.expectedChildren)
    end)

    it.each(cases.render_default_title, "$desc", function(testCase)
      ---@type SidebarDefaultTitleCase
      local tc = testCase
      local result = sidebar.render(tc.props)
      local header = result.children[1]
      expect(header.children[1].props.text).toBe(tc.expectedTitle)
    end)
  end)

  describe("header", function()
    it.each(cases.header, "$desc", function(testCase)
      ---@type SidebarHeaderCase
      local tc = testCase
      local result = sidebar.header(tc.props)
      expect(result.type).toBe("Box")
      expect(result.children[1].props.text).toBe(tc.expected)
    end)
  end)

  describe("item", function()
    it.each(cases.item, "$desc", function(testCase)
      ---@type SidebarItemCase
      local tc = testCase
      local result = sidebar.item(tc.item, tc.currentPath)
      expect(result.type).toBe("Button")
      expect(result.props.variant).toBe(tc.expectedVariant)
      expect(result.props.text).toBe(tc.item.label)
    end)
  end)
end)
