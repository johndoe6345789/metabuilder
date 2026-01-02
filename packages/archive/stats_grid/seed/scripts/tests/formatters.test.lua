-- Formatters module tests

describe("Formatters Module", function()
  local cases = load_cases("formatters.cases.json")
  local formatters = require("formatters")

  describe("formatLabel", function()
    it_each(cases.formatLabel, "$desc", function(tc)
      local result = formatters.formatLabel(tc.input)
      expect(result).toBe(tc.expected)
    end)
  end)

  describe("formatValue", function()
    it_each(cases.formatValue, "$desc", function(tc)
      local result = formatters.formatValue(tc.input)
      expect(result).toBe(tc.expected)
    end)
  end)
end)
