-- Tests for dashboard stats.lua module

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
    it("should calculate correct percentage", function()
      expect(stats.calculate_percentage(25, 100)).toBe(25)
    end)
    
    it("should handle decimal results", function()
      expect(stats.calculate_percentage(1, 3)).toBeCloseTo(33.33, 1)
    end)
    
    it("should return 0 when total is 0", function()
      expect(stats.calculate_percentage(10, 0)).toBe(0)
    end)
    
    it("should handle 100%", function()
      expect(stats.calculate_percentage(100, 100)).toBe(100)
    end)
    
    it("should handle values greater than total", function()
      expect(stats.calculate_percentage(150, 100)).toBe(150)
    end)
  end)
  
  describe("calculate_change", function()
    it("should calculate positive change", function()
      expect(stats.calculate_change(120, 100)).toBe(20)
    end)
    
    it("should calculate negative change", function()
      expect(stats.calculate_change(80, 100)).toBe(-20)
    end)
    
    it("should return 0 for no change", function()
      expect(stats.calculate_change(100, 100)).toBe(0)
    end)
    
    it("should return 100 for growth from 0", function()
      expect(stats.calculate_change(50, 0)).toBe(100)
    end)
    
    it("should return 0 for 0 to 0", function()
      expect(stats.calculate_change(0, 0)).toBe(0)
    end)
  end)
  
  describe("format_number", function()
    it("should format millions", function()
      expect(stats.format_number(1500000)).toBe("1.5M")
    end)
    
    it("should format thousands", function()
      expect(stats.format_number(2500)).toBe("2.5K")
    end)
    
    it("should not format small numbers", function()
      expect(stats.format_number(999)).toBe("999")
    end)
    
    it("should format exactly 1 million", function()
      expect(stats.format_number(1000000)).toBe("1.0M")
    end)
    
    it("should format exactly 1 thousand", function()
      expect(stats.format_number(1000)).toBe("1.0K")
    end)
  end)
  
  describe("aggregate", function()
    it("should sum field values", function()
      local items = {
        { value = 10 },
        { value = 20 },
        { value = 30 }
      }
      expect(stats.aggregate(items, "value")).toBe(60)
    end)
    
    it("should handle empty array", function()
      expect(stats.aggregate({}, "value")).toBe(0)
    end)
    
    it("should handle missing fields", function()
      local items = {
        { value = 10 },
        { other = 20 },
        { value = 30 }
      }
      expect(stats.aggregate(items, "value")).toBe(40)
    end)
  end)
  
  describe("average", function()
    it("should calculate average", function()
      local items = {
        { score = 10 },
        { score = 20 },
        { score = 30 }
      }
      expect(stats.average(items, "score")).toBe(20)
    end)
    
    it("should return 0 for empty array", function()
      expect(stats.average({}, "score")).toBe(0)
    end)
    
    it("should handle single item", function()
      local items = {{ score = 50 }}
      expect(stats.average(items, "score")).toBe(50)
    end)
  end)
end)
