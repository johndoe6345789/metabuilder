-- Tests for dashboard stats.lua module
-- Uses parameterized tests for comprehensive coverage

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
    it_each({
      { value = 25,  total = 100, expected = 25,  desc = "25 of 100" },
      { value = 50,  total = 100, expected = 50,  desc = "50 of 100" },
      { value = 100, total = 100, expected = 100, desc = "100 of 100" },
      { value = 0,   total = 100, expected = 0,   desc = "0 of 100" },
      { value = 150, total = 100, expected = 150, desc = "150 of 100 (over 100%)" },
      { value = 1,   total = 4,   expected = 25,  desc = "1 of 4" },
      { value = 10,  total = 0,   expected = 0,   desc = "division by zero" },
    })("should return $expected% for $desc", function(tc)
      expect(stats.calculate_percentage(tc.value, tc.total)).toBe(tc.expected)
    end)
  end)
  
  describe("calculate_change", function()
    it_each({
      { current = 120, previous = 100, expected = 20,   desc = "20% increase" },
      { current = 80,  previous = 100, expected = -20,  desc = "20% decrease" },
      { current = 100, previous = 100, expected = 0,    desc = "no change" },
      { current = 200, previous = 100, expected = 100,  desc = "100% increase" },
      { current = 50,  previous = 100, expected = -50,  desc = "50% decrease" },
      { current = 50,  previous = 0,   expected = 100,  desc = "growth from zero" },
      { current = 0,   previous = 0,   expected = 0,    desc = "zero to zero" },
      { current = 0,   previous = 100, expected = -100, desc = "100% decrease" },
    })("should calculate $desc", function(tc)
      expect(stats.calculate_change(tc.current, tc.previous)).toBe(tc.expected)
    end)
  end)
  
  describe("format_number", function()
    it_each({
      { num = 0,         expected = "0" },
      { num = 1,         expected = "1" },
      { num = 999,       expected = "999" },
      { num = 1000,      expected = "1.0K" },
      { num = 1500,      expected = "1.5K" },
      { num = 2500,      expected = "2.5K" },
      { num = 10000,     expected = "10.0K" },
      { num = 999999,    expected = "1000.0K" },
      { num = 1000000,   expected = "1.0M" },
      { num = 1500000,   expected = "1.5M" },
      { num = 10000000,  expected = "10.0M" },
      { num = 123456789, expected = "123.5M" },
    })("should format $num as $expected", function(tc)
      expect(stats.format_number(tc.num)).toBe(tc.expected)
    end)
  end)
  
  describe("aggregate", function()
    it_each({
      { items = {},                                        field = "value", expected = 0,  desc = "empty array" },
      { items = {{ value = 10 }},                          field = "value", expected = 10, desc = "single item" },
      { items = {{ value = 10 }, { value = 20 }},          field = "value", expected = 30, desc = "two items" },
      { items = {{ value = 10 }, { value = 20 }, { value = 30 }}, field = "value", expected = 60, desc = "three items" },
      { items = {{ other = 10 }},                          field = "value", expected = 0,  desc = "missing field" },
      { items = {{ value = 10 }, { other = 20 }},          field = "value", expected = 10, desc = "partial fields" },
    })("should return $expected for $desc", function(tc)
      expect(stats.aggregate(tc.items, tc.field)).toBe(tc.expected)
    end)
  end)
  
  describe("average", function()
    it_each({
      { items = {},                                        field = "score", expected = 0,  desc = "empty array" },
      { items = {{ score = 50 }},                          field = "score", expected = 50, desc = "single item" },
      { items = {{ score = 10 }, { score = 20 }},          field = "score", expected = 15, desc = "two items" },
      { items = {{ score = 10 }, { score = 20 }, { score = 30 }}, field = "score", expected = 20, desc = "three items" },
      { items = {{ score = 100 }, { score = 0 }},          field = "score", expected = 50, desc = "with zero" },
    })("should return $expected for $desc", function(tc)
      expect(stats.average(tc.items, tc.field)).toBe(tc.expected)
    end)
  end)
end)
