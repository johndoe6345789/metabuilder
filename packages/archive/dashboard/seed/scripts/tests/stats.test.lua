-- Tests for dashboard stats.lua module
-- Loads test cases from JSON file

local cases = load_cases("stats.cases.json")

describe("dashboard/stats", function()
  local stats
  
  beforeEach(function()
    stats = {
      calculate_percentage = function(value, total)
        if total == 0 then return 0 end
        return (value / total) * 100
      end,
      
      calculate_change = function(current, previous)
        if previous == 0 then
          return current > 0 and 100 or 0
        end
        return ((current - previous) / previous) * 100
      end,
      
      format_number = function(num)
        if num >= 1000000 then
          return string.format("%.1fM", num / 1000000)
        elseif num >= 1000 then
          return string.format("%.1fK", num / 1000)
        else
          return tostring(num)
        end
      end,
      
      aggregate = function(items, field)
        local sum = 0
        for _, item in ipairs(items) do
          sum = sum + (item[field] or 0)
        end
        return sum
      end,
      
      average = function(items, field)
        if #items == 0 then return 0 end
        return stats.aggregate(items, field) / #items
      end
    }
  end)
  
  describe("calculate_percentage", function()
    it_each(cases.calculate_percentage)("should return $expected% for $desc", function(tc)
      expect(stats.calculate_percentage(tc.value, tc.total)).toBe(tc.expected)
    end)
  end)
  
  describe("calculate_change", function()
    it_each(cases.calculate_change)("should calculate $desc", function(tc)
      expect(stats.calculate_change(tc.current, tc.previous)).toBe(tc.expected)
    end)
  end)
  
  describe("format_number", function()
    it_each(cases.format_number)("should format $num as $expected", function(tc)
      expect(stats.format_number(tc.num)).toBe(tc.expected)
    end)
  end)
  
  describe("aggregate", function()
    it_each(cases.aggregate)("should return $expected for $desc", function(tc)
      expect(stats.aggregate(tc.items, tc.field)).toBe(tc.expected)
    end)
  end)
  
  describe("average", function()
    it_each(cases.average)("should return $expected for $desc", function(tc)
      expect(stats.average(tc.items, tc.field)).toBe(tc.expected)
    end)
  end)
end)
