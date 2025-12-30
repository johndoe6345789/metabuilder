-- Stats module tests
-- Uses lua_test framework with parameterized test cases

describe("Stats Module", function()
  local cases = load_cases("stats.cases.json")
  local stats = require("stats")

  describe("formatLabel", function()
    it_each(cases.formatLabel, "$desc", function(tc)
      local result = stats.formatLabel(tc.input)
      expect(result).toBe(tc.expected)
    end)
  end)

  describe("formatValue", function()
    it_each(cases.formatValue, "$desc", function(tc)
      local result = stats.formatValue(tc.input)
      expect(result).toBe(tc.expected)
    end)
  end)

  describe("createStatItems", function()
    it("creates items from stats data without config", function()
      local result = stats.createStatItems({ total = 100, errors = 5 }, nil)
      expect(#result).toBeGreaterThan(0)
    end)

    it("creates items from stats data with config", function()
      local config = {
        { key = "total", label = "Total", color = "white" },
        { key = "errors", label = "Errors", color = "red" }
      }
      local result = stats.createStatItems({ total = 100, errors = 5 }, config)
      expect(#result).toBe(2)
      expect(result[1].key).toBe("total")
      expect(result[1].label).toBe("Total")
      expect(result[1].value).toBe(100)
    end)
  end)

  describe("getColorClass", function()
    it("returns correct color class for valid colors", function()
      local redClass = stats.getColorClass("red")
      expect(redClass).toBe("text-red-400")
    end)

    it("returns default for invalid colors", function()
      local defaultClass = stats.getColorClass("invalid")
      expect(defaultClass).toBeDefined()
    end)
  end)

  describe("getDefaultGridClass", function()
    it("returns default grid class", function()
      local gridClass = stats.getDefaultGridClass()
      expect(gridClass).toBeDefined()
      expect(type(gridClass)).toBe("string")
    end)
  end)
end)
