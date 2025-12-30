-- Notification Center functionality tests
-- Uses lua_test framework with parameterized test cases

---@class NotificationItem
---@field label? string
---@field count? number
---@field severity? string

---@class CalculateTotalCase
---@field items NotificationItem[]|nil
---@field expected integer
---@field desc string

---@class SeverityClassCase
---@field severity string|nil
---@field expected string
---@field desc string

---@class ToastDurationCase
---@field message string
---@field duration number|nil
---@field expected_duration integer
---@field desc string

---@class SummaryTitleCase
---@field title string|nil
---@field expected_title string
---@field desc string

---@class SummaryItemsCase
---@field items NotificationItem[]|nil
---@field expected_count integer
---@field desc string

---@class NotificationCases
---@field calculate_total CalculateTotalCase[]
---@field get_severity_class SeverityClassCase[]
---@field toast_duration ToastDurationCase[]
---@field prepare_summary { title_variations: SummaryTitleCase[], items_processing: SummaryItemsCase[] }

describe("Calculate Total", function()
  ---@type NotificationCases
  local cases = load_cases("notifications.cases.json")
  local calculate_total = require("calculate_total")
  
  it_each(cases.calculate_total, "$desc", function(tc)
    local result = calculate_total(tc.items)
    expect(result).toBe(tc.expected)
  end)
end)

describe("Get Severity Class", function()
  local cases = load_cases("notifications.cases.json")
  local get_severity_class = require("get_severity_class")
  
  it_each(cases.get_severity_class, "$desc", function(tc)
    local result = get_severity_class(tc.severity)
    expect(result).toBe(tc.expected)
  end)
end)

describe("Toast Notifications", function()
  local cases = load_cases("notifications.cases.json")
  
  describe("success toast", function()
    local toast_success = require("toast_success")
    
    it("creates success toast with correct properties", function()
      local result = toast_success("Test message", 5000)
      expect(result.type).toBe("toast")
      expect(result.variant).toBe("success")
      expect(result.message).toBe("Test message")
      expect(result.duration).toBe(5000)
      expect(result.icon).toBe("check")
    end)
    
    it_each(cases.toast_duration, "$desc", function(tc)
      local toast_success = require("toast_success")
      local result = toast_success(tc.message, tc.duration)
      expect(result.duration).toBe(tc.expected_duration)
    end)
  end)
  
  describe("error toast", function()
    local toast_error = require("toast_error")
    
    it("creates error toast with correct properties", function()
      local result = toast_error("Error message")
      expect(result.type).toBe("toast")
      expect(result.variant).toBe("error")
      expect(result.message).toBe("Error message")
    end)
  end)
  
  describe("warning toast", function()
    local toast_warning = require("toast_warning")
    
    it("creates warning toast with correct properties", function()
      local result = toast_warning("Warning message")
      expect(result.type).toBe("toast")
      expect(result.variant).toBe("warning")
      expect(result.message).toBe("Warning message")
    end)
  end)
  
  describe("info toast", function()
    local toast_info = require("toast_info")
    
    it("creates info toast with correct properties", function()
      local result = toast_info("Info message")
      expect(result.type).toBe("toast")
      expect(result.variant).toBe("info")
      expect(result.message).toBe("Info message")
    end)
  end)
end)

describe("Prepare Summary", function()
  local cases = load_cases("notifications.cases.json")
  local prepare_summary = require("prepare_summary")
  
  describe("title handling", function()
    it_each(cases.prepare_summary.title_variations, "$desc", function(tc)
      local props = { title = tc.title, items = {} }
      local result = prepare_summary(props)
      expect(result.title).toBe(tc.expected_title)
    end)
  end)
  
  describe("items processing", function()
    it_each(cases.prepare_summary.items_processing, "$desc", function(tc)
      local props = { items = tc.items }
      local result = prepare_summary(props)
      expect(#result.items).toBe(tc.expected_count)
    end)
    
    it("enriches items with severity classes", function()
      local props = {
        items = {
          { label = "Test", count = 5, severity = "warning" }
        }
      }
      local result = prepare_summary(props)
      expect(result.items[1].classes).toBe("summary-item--warning")
    end)
  end)
end)
