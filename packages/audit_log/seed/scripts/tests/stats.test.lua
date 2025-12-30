-- Stats calculation tests for audit_log package
local stats = require("stats")

describe("Audit Log Stats Module", function()
  describe("calculateStats", function()
    it("should calculate stats from empty logs", function()
      local logs = {}
      local result = stats.calculateStats(logs)

      expect(result.total).toBe(0)
      expect(result.successful).toBe(0)
      expect(result.failed).toBe(0)
      expect(result.rateLimit).toBe(0)
    end)

    it("should calculate stats from successful logs", function()
      local logs = {
        { success = true },
        { success = true },
        { success = true }
      }
      local result = stats.calculateStats(logs)

      expect(result.total).toBe(3)
      expect(result.successful).toBe(3)
      expect(result.failed).toBe(0)
      expect(result.rateLimit).toBe(0)
    end)

    it("should calculate stats from failed logs", function()
      local logs = {
        { success = false, error = "Permission denied" },
        { success = false, error = "Not found" }
      }
      local result = stats.calculateStats(logs)

      expect(result.total).toBe(2)
      expect(result.successful).toBe(0)
      expect(result.failed).toBe(2)
      expect(result.rateLimit).toBe(0)
    end)

    it("should calculate stats from rate limited logs", function()
      local logs = {
        { success = false, error = "Rate limit exceeded" },
        { success = false, error = "Rate limit exceeded" }
      }
      local result = stats.calculateStats(logs)

      expect(result.total).toBe(2)
      expect(result.successful).toBe(0)
      expect(result.failed).toBe(0)
      expect(result.rateLimit).toBe(2)
    end)

    it("should calculate mixed stats", function()
      local logs = {
        { success = true },
        { success = false, error = "Permission denied" },
        { success = false, error = "Rate limit exceeded" },
        { success = true }
      }
      local result = stats.calculateStats(logs)

      expect(result.total).toBe(4)
      expect(result.successful).toBe(2)
      expect(result.failed).toBe(1)
      expect(result.rateLimit).toBe(1)
    end)
  end)

  describe("prepareStatsDisplay", function()
    it("should format stats for display", function()
      local stats_data = {
        total = 100,
        successful = 75,
        failed = 20,
        rateLimit = 5
      }
      local result = stats.prepareStatsDisplay(stats_data)

      expect(result).toBeTruthy()
      expect(result.total).toBe(100)
      expect(result.successful).toBe(75)
      expect(result.failed).toBe(20)
      expect(result.rateLimit).toBe(5)
    end)
  end)
end)
