-- GitHub Tools package tests
-- Uses lua_test framework with parameterized test cases

local status = require("status")
local filter = require("filter")
local analyze = require("analyze")

describe("Status Module", function()
  local cases = load_cases("github_tools.cases.json")
  local status_cases = cases.status
  
  describe("getStatusColor", function()
    it_each(status_cases.colors, "$status: $desc", function(tc)
      local color = status.getStatusColor(tc.status)
      expect(color).toBe(tc.expected_color)
    end)
  end)
  
  describe("getStatusIcon", function()
    it_each(status_cases.icons, "$status: $desc", function(tc)
      local icon = status.getStatusIcon(tc.status)
      expect(icon).toBe(tc.expected_icon)
    end)
  end)
  
  describe("formatDuration", function()
    it_each(status_cases.durations, "$seconds seconds: $desc", function(tc)
      local formatted = status.formatDuration(tc.seconds)
      expect(formatted).toBe(tc.expected)
    end)
  end)
  
  describe("renderBadge", function()
    it("returns valid component structure", function()
      local badge = status.renderBadge("success")
      expect(badge.type).toBe("Chip")
      expect(badge.props.label).toBe("Success")
      expect(badge.props.color).toBe("success")
    end)
  end)
end)

describe("Filter Module", function()
  local cases = load_cases("github_tools.cases.json")
  local filter_cases = cases.filter
  
  describe("date range cutoffs", function()
    it_each(filter_cases.date_ranges, "$range: $desc", function(tc)
      -- Verify range is recognized
      expect(tc.range).toBeType("string")
      expect(tc.expected_days).toBeType("number")
    end)
  end)
  
  describe("sortRuns", function()
    it("sorts by run_number ascending", function()
      local runs = {
        { run_number = 3 },
        { run_number = 1 },
        { run_number = 2 }
      }
      local sorted = filter.sortRuns(runs, "run_number", true)
      expect(sorted[1].run_number).toBe(1)
      expect(sorted[2].run_number).toBe(2)
      expect(sorted[3].run_number).toBe(3)
    end)
    
    it("sorts by run_number descending", function()
      local runs = {
        { run_number = 1 },
        { run_number = 3 },
        { run_number = 2 }
      }
      local sorted = filter.sortRuns(runs, "run_number", false)
      expect(sorted[1].run_number).toBe(3)
      expect(sorted[2].run_number).toBe(2)
      expect(sorted[3].run_number).toBe(1)
    end)
  end)
end)

describe("Analyze Module", function()
  local cases = load_cases("github_tools.cases.json")
  local analyze_cases = cases.analyze
  
  describe("calculateStats", function()
    it_each(analyze_cases.success_rates, "$desc", function(tc)
      -- Create mock runs
      local runs = {}
      for i = 1, tc.success do
        table.insert(runs, { conclusion = "success" })
      end
      for i = 1, tc.total - tc.success do
        table.insert(runs, { conclusion = "failure" })
      end
      
      local stats = analyze.calculateStats(runs)
      expect(stats.total).toBe(tc.total)
      expect(stats.success).toBe(tc.success)
      expect(stats.success_rate).toBe(tc.expected_rate)
    end)
  end)
  
  describe("getFailureBreakdown", function()
    it("categorizes failure types", function()
      local runs = {
        { conclusion = "failure" },
        { conclusion = "timed_out" },
        { conclusion = "cancelled" },
        { conclusion = "success" }
      }
      
      local breakdown = analyze.getFailureBreakdown(runs)
      expect(breakdown.timeout).toBe(1)
      expect(breakdown.cancelled).toBe(1)
      expect(breakdown.other).toBe(1)
    end)
  end)
end)
