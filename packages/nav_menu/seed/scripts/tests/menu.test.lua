-- Menu tests for nav_menu package
-- Tests menu rendering and permission filtering

describe("Menu", function()
  -- Mock check module
  local original_can_access
  
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
    it.each({
      { user = { level = 0 }, item = { label = "Home" }, expected = true, desc = "item with no minLevel" },
      { user = { level = 0 }, item = { label = "Admin", minLevel = 3 }, expected = false, desc = "low level user for admin" },
      { user = { level = 3 }, item = { label = "Admin", minLevel = 3 }, expected = true, desc = "admin for admin item" },
      { user = { level = 5 }, item = { label = "Admin", minLevel = 3 }, expected = true, desc = "high level for admin item" },
      { user = {}, item = { label = "Users", minLevel = 2 }, expected = false, desc = "no level user" },
    })("should return $expected for $desc", function(testCase)
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
    it("should filter items by permission", function()
      local props = {
        user = { level = 2 },
        items = {
          { label = "Home", path = "/" },
          { label = "Admin", path = "/admin", minLevel = 3 },
          { label = "Users", path = "/users", minLevel = 2 }
        }
      }
      local result = menu.render(props)
      expect(result.type).toBe("Flex")
      expect(#result.children).toBe(2) -- Home and Users, not Admin
    end)
  end)
end)
