-- Sidebar tests for nav_menu package
-- Tests sidebar rendering and active state

local sidebar = require("sidebar")

describe("Sidebar", function()
  describe("render", function()
    it("should render sidebar container with header and items", function()
      local props = {
        title = "Dashboard",
        items = {
          { label = "Home", path = "/" },
          { label = "Settings", path = "/settings" }
        }
      }
      local result = sidebar.render(props)
      expect(result.type).toBe("Box")
      expect(#result.children).toBe(2) -- header and stack
    end)

    it("should use default title when not provided", function()
      local props = { items = {} }
      local result = sidebar.render(props)
      local header = result.children[1]
      expect(header.children[1].props.text).toBe("Menu")
    end)
  end)

  describe("header", function()
    it.each({
      { props = { title = "Admin" }, expected = "Admin", desc = "custom title" },
      { props = {}, expected = "Menu", desc = "default title" },
    })("should render $desc", function(testCase)
      local result = sidebar.header(testCase.props)
      expect(result.type).toBe("Box")
      expect(result.children[1].props.text).toBe(testCase.expected)
    end)
  end)

  describe("item", function()
    it.each({
      { item = { label = "Home", path = "/" }, currentPath = "/", expectedVariant = "secondary", desc = "active item" },
      { item = { label = "Home", path = "/" }, currentPath = "/other", expectedVariant = "ghost", desc = "inactive item" },
      { item = { label = "Home", path = "/" }, currentPath = nil, expectedVariant = "ghost", desc = "no current path" },
    })("should render $desc with variant=$expectedVariant", function(testCase)
      local result = sidebar.item(testCase.item, testCase.currentPath)
      expect(result.type).toBe("Button")
      expect(result.props.variant).toBe(testCase.expectedVariant)
      expect(result.props.text).toBe(testCase.item.label)
    end)
  end)
end)
