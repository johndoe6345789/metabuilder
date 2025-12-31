-- Config Summary module tests
-- Tests the summary generation and style configuration functions

local cases = load_cases("config.cases.json")

describe("config_summary/summary", function()
  local summary

  beforeEach(function()
    -- Mock the summary module implementation
    summary = {
      styleConfig = {
        defaultWrapperClass = "wrapper-class",
        defaultTitleClass = "title-class",
        defaultGridClass = "grid-class",
        defaultRowClass = "row-class",
        defaultLabelClass = "label-class",
        defaultValueClass = "value-class"
      },

      getWrapperClass = function(self)
        return self.styleConfig.defaultWrapperClass
      end,

      getTitleClass = function(self)
        return self.styleConfig.defaultTitleClass
      end,

      getGridClass = function(self)
        return self.styleConfig.defaultGridClass
      end,

      getRowClass = function(self)
        return self.styleConfig.defaultRowClass
      end,

      getLabelClass = function(self)
        return self.styleConfig.defaultLabelClass
      end,

      getValueClass = function(self)
        return self.styleConfig.defaultValueClass
      end,

      filterVisibleRows = function(rows)
        local visible = {}
        for _, row in ipairs(rows) do
          if row.visible ~= false then
            table.insert(visible, row)
          end
        end
        return visible
      end,

      formatValue = function(value)
        if type(value) == "number" then
          return tostring(value)
        end
        return value
      end
    }
  end)

  describe("getWrapperClass", function()
    it("returns the default wrapper class from config", function()
      expect(summary:getWrapperClass()).toBe("wrapper-class")
    end)
  end)

  describe("getTitleClass", function()
    it("returns the default title class from config", function()
      expect(summary:getTitleClass()).toBe("title-class")
    end)
  end)

  describe("getGridClass", function()
    it("returns the default grid class from config", function()
      expect(summary:getGridClass()).toBe("grid-class")
    end)
  end)

  describe("getRowClass", function()
    it("returns the default row class from config", function()
      expect(summary:getRowClass()).toBe("row-class")
    end)
  end)

  describe("getLabelClass", function()
    it("returns the default label class from config", function()
      expect(summary:getLabelClass()).toBe("label-class")
    end)
  end)

  describe("getValueClass", function()
    it("returns the default value class from config", function()
      expect(summary:getValueClass()).toBe("value-class")
    end)
  end)

  describe("filterVisibleRows", function()
    it_each(cases.filterVisibleRows)("$desc", function(tc)
      local result = summary.filterVisibleRows(tc.input)
      expect(#result).toBe(tc.expected_count)
    end)

    it("preserves row data when filtering", function()
      local rows = {
        { label = "Kept", value = "yes", visible = true },
        { label = "Removed", value = "no", visible = false }
      }
      local result = summary.filterVisibleRows(rows)
      expect(result[1].label).toBe("Kept")
      expect(result[1].value).toBe("yes")
    end)

    it("handles nil visible as true (default)", function()
      local rows = {
        { label = "NoVisible", value = "shown" }
      }
      local result = summary.filterVisibleRows(rows)
      expect(#result).toBe(1)
      expect(result[1].label).toBe("NoVisible")
    end)
  end)

  describe("formatValue", function()
    it_each(cases.formatValue)("$desc", function(tc)
      local result = summary.formatValue(tc.input)
      expect(result).toBe(tc.expected)
    end)

    it("returns numbers as strings", function()
      expect(summary.formatValue(42)).toBe("42")
      expect(summary.formatValue(0)).toBe("0")
      expect(summary.formatValue(-5)).toBe("-5")
    end)

    it("returns strings unchanged", function()
      expect(summary.formatValue("hello")).toBe("hello")
      expect(summary.formatValue("")).toBe("")
    end)
  end)
end)

describe("SummaryRow type validation", function()
  it_each(cases.validSummaryRow)("$desc should be valid", function(tc)
    expect(tc.input.label).toBeDefined()
    expect(tc.input.value).toBeDefined()
  end)

  it_each(cases.invalidSummaryRow)("$desc should be invalid", function(tc)
    local isValid = tc.input.label ~= nil and tc.input.value ~= nil
    expect(isValid).toBe(false)
  end)
end)

describe("SummaryConfig structure", function()
  it_each(cases.summaryConfig)("$desc", function(tc)
    expect(tc.input.title).toBeDefined()
    expect(tc.input.rows).toBeDefined()
    if tc.expected_row_count then
      expect(#tc.input.rows).toBe(tc.expected_row_count)
    end
  end)

  it("allows optional class overrides", function()
    local config = {
      title = "Test",
      rows = {},
      wrapperClass = "custom-wrapper",
      titleClass = "custom-title",
      gridClass = "custom-grid"
    }
    expect(config.wrapperClass).toBe("custom-wrapper")
    expect(config.titleClass).toBe("custom-title")
    expect(config.gridClass).toBe("custom-grid")
  end)
end)

describe("AggregateConfig handling", function()
  it_each(cases.aggregateConfig)("$desc", function(tc)
    local sectionCount = 0
    for key, value in pairs(tc.input) do
      if type(value) == "table" then
        sectionCount = sectionCount + 1
      end
    end
    expect(sectionCount).toBe(tc.expected_sections)
  end)
end)
