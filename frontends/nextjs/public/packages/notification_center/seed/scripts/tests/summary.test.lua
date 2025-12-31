-- Summary tests for notification_center package
-- Tests calculate_total, get_severity_class, and prepare_summary

local calculate_total = require("calculate_total")
local get_severity_class = require("get_severity_class")
local prepare_summary = require("prepare_summary")

describe("Notification Summary", function()
  describe("calculate_total", function()
    it.each({
      { items = {}, expected = 0, desc = "empty items" },
      { items = { { count = 5 } }, expected = 5, desc = "single item" },
      { items = { { count = 3 }, { count = 7 }, { count = 2 } }, expected = 12, desc = "multiple items" },
      { items = { { count = 0 }, { count = 10 } }, expected = 10, desc = "items with zero" },
      { items = { {}, { count = 5 } }, expected = 5, desc = "missing count field" },
      { items = { { count = -1 }, { count = 5 } }, expected = 5, desc = "negative count ignored" },
    })("should return $expected for $desc", function(testCase)
      local result = calculate_total(testCase.items)
      expect(result).toBe(testCase.expected)
    end)
  end)

  describe("get_severity_class", function()
    it.each({
      { severity = "info", expected = "summary-item--info" },
      { severity = "success", expected = "summary-item--success" },
      { severity = "warning", expected = "summary-item--warning" },
      { severity = "error", expected = "summary-item--error" },
      { severity = nil, expected = "summary-item--info" },
      { severity = "unknown", expected = "summary-item--info" },
    })("should return $expected for severity=$severity", function(testCase)
      local result = get_severity_class(testCase.severity)
      expect(result).toBe(testCase.expected)
    end)
  end)

  describe("prepare_summary", function()
    it("should use defaults when props empty", function()
      local result = prepare_summary({})
      expect(result.title).toBe("Notification Summary")
      expect(result.totalLabel).toBe("Total")
      expect(#result.items).toBe(4) -- default items
    end)

    it("should use custom title and subtitle", function()
      local result = prepare_summary({ title = "Alerts", subtitle = "Last 24 hours" })
      expect(result.title).toBe("Alerts")
      expect(result.subtitle).toBe("Last 24 hours")
    end)

    it("should enrich items with severity classes", function()
      local result = prepare_summary({
        items = {
          { label = "Errors", count = 5, severity = "error" }
        }
      })
      expect(result.items[1].classes).toBe("summary-item--error")
    end)

    it("should calculate total from items", function()
      local result = prepare_summary({
        items = {
          { label = "A", count = 10 },
          { label = "B", count = 5 }
        }
      })
      expect(result.total).toBe(15)
    end)
  end)
end)
