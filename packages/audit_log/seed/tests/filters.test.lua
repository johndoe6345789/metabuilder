-- Tests for audit_log filter functions
-- Uses lua_test framework with parameterized test cases

local M = {}

-- Sample audit log data for testing
local function createSampleLogs()
  return {
    {
      id = "log1",
      operation = "create",
      resource = "user",
      resourceId = "user_1",
      username = "admin",
      timestamp = 1000000,
      ipAddress = "192.168.1.1",
      success = true,
      errorMessage = nil
    },
    {
      id = "log2",
      operation = "read",
      resource = "user",
      resourceId = "user_1",
      username = "viewer",
      timestamp = 1100000,
      ipAddress = "192.168.1.2",
      success = true,
      errorMessage = nil
    },
    {
      id = "log3",
      operation = "update",
      resource = "settings",
      resourceId = "settings_1",
      username = "admin",
      timestamp = 1200000,
      ipAddress = "192.168.1.1",
      success = false,
      errorMessage = "Permission denied"
    },
    {
      id = "log4",
      operation = "delete",
      resource = "post",
      resourceId = "post_1",
      username = "Admin_User",
      timestamp = 1300000,
      ipAddress = "192.168.1.3",
      success = true,
      errorMessage = nil
    },
    {
      id = "log5",
      operation = "create",
      resource = "post",
      resourceId = "post_2",
      username = "editor",
      timestamp = 1400000,
      ipAddress = "192.168.1.4",
      success = true,
      errorMessage = nil
    }
  }
end

---@param framework TestFramework
---@param assertions AssertionsModule
---@param mocks MocksModule
function M.defineTests(framework, assertions, mocks)
  local describe = framework.describe
  local it = framework.it
  local it_each = framework.it_each
  local beforeEach = framework.beforeEach
  local expect = assertions.expect
  
  -- Import filter modules
  local filterByOperation = require("filters.filter_by_operation")
  local filterByResource = require("filters.filter_by_resource")
  local filterBySuccess = require("filters.filter_by_success")
  local filterByUsername = require("filters.filter_by_username")
  local filterByDateRange = require("filters.filter_by_date_range")
  local applyFilters = require("filters.apply_filters")
  local getFilterOptions = require("filters.get_filter_options")
  
  describe("audit_log filters", function()
    
    describe("filterByOperation", function()
      local logs
      
      beforeEach(function()
        logs = createSampleLogs()
      end)
      
      it_each({
        { operation = "create", expected = 2 },
        { operation = "read", expected = 1 },
        { operation = "update", expected = 1 },
        { operation = "delete", expected = 1 },
        { operation = "nonexistent", expected = 0 }
      })("should return $expected logs for operation '$operation'", function(tc)
        local result = filterByOperation.filterByOperation(logs, tc.operation)
        expect(#result).toBe(tc.expected)
      end)
      
      it("should return all logs when operation is nil", function()
        local result = filterByOperation.filterByOperation(logs, nil)
        expect(#result).toBe(5)
      end)
      
      it("should return all logs when operation is empty string", function()
        local result = filterByOperation.filterByOperation(logs, "")
        expect(#result).toBe(5)
      end)
      
      it("should return empty array when logs is nil", function()
        local result = filterByOperation.filterByOperation(nil, "create")
        expect(#result).toBe(0)
      end)
    end)
    
    describe("filterByResource", function()
      local logs
      
      beforeEach(function()
        logs = createSampleLogs()
      end)
      
      it_each({
        { resource = "user", expected = 2 },
        { resource = "settings", expected = 1 },
        { resource = "post", expected = 2 },
        { resource = "nonexistent", expected = 0 }
      })("should return $expected logs for resource '$resource'", function(tc)
        local result = filterByResource.filterByResource(logs, tc.resource)
        expect(#result).toBe(tc.expected)
      end)
      
      it("should return all logs when resource is nil", function()
        local result = filterByResource.filterByResource(logs, nil)
        expect(#result).toBe(5)
      end)
    end)
    
    describe("filterBySuccess", function()
      local logs
      
      beforeEach(function()
        logs = createSampleLogs()
      end)
      
      it("should return 4 logs when success is true", function()
        local result = filterBySuccess.filterBySuccess(logs, true)
        expect(#result).toBe(4)
      end)
      
      it("should return 1 log when success is false", function()
        local result = filterBySuccess.filterBySuccess(logs, false)
        expect(#result).toBe(1)
        expect(result[1].id).toBe("log3")
      end)
      
      it("should return all logs when success is nil", function()
        local result = filterBySuccess.filterBySuccess(logs, nil)
        expect(#result).toBe(5)
      end)
    end)
    
    describe("filterByUsername", function()
      local logs
      
      beforeEach(function()
        logs = createSampleLogs()
      end)
      
      it_each({
        { username = "admin", expected = 3, desc = "case-insensitive match" },
        { username = "ADMIN", expected = 3, desc = "uppercase match" },
        { username = "viewer", expected = 1, desc = "exact match" },
        { username = "editor", expected = 1, desc = "single match" },
        { username = "nonexistent", expected = 0, desc = "no match" }
      })("should handle $desc - '$username' -> $expected results", function(tc)
        local result = filterByUsername.filterByUsername(logs, tc.username)
        expect(#result).toBe(tc.expected)
      end)
      
      it("should return all logs when username is nil", function()
        local result = filterByUsername.filterByUsername(logs, nil)
        expect(#result).toBe(5)
      end)
      
      it("should return all logs when username is empty string", function()
        local result = filterByUsername.filterByUsername(logs, "")
        expect(#result).toBe(5)
      end)
    end)
    
    describe("filterByDateRange", function()
      local logs
      
      beforeEach(function()
        logs = createSampleLogs()
      end)
      
      it_each({
        { startTime = 1000000, endTime = 1200000, expected = 3 },
        { startTime = 1200000, endTime = 1400000, expected = 3 },
        { startTime = 1500000, endTime = 2000000, expected = 0 },
        { startTime = nil, endTime = 1200000, expected = 3 },
        { startTime = 1200000, endTime = nil, expected = 3 },
        { startTime = nil, endTime = nil, expected = 5 }
      })("should filter correctly with startTime=$startTime, endTime=$endTime -> $expected", function(tc)
        local result = filterByDateRange.filterByDateRange(logs, tc.startTime, tc.endTime)
        expect(#result).toBe(tc.expected)
      end)
    end)
    
    describe("applyFilters", function()
      local logs
      
      beforeEach(function()
        logs = createSampleLogs()
      end)
      
      it("should apply operation filter only", function()
        local result = applyFilters.applyFilters(logs, { operation = "create" })
        expect(#result).toBe(2)
      end)
      
      it("should apply multiple filters", function()
        local result = applyFilters.applyFilters(logs, {
          operation = "create",
          resource = "user"
        })
        expect(#result).toBe(1)
        expect(result[1].id).toBe("log1")
      end)
      
      it("should apply success and username filters", function()
        local result = applyFilters.applyFilters(logs, {
          success = true,
          username = "admin"
        })
        expect(#result).toBe(2)
      end)
      
      it("should apply date range with other filters", function()
        local result = applyFilters.applyFilters(logs, {
          startTime = 1000000,
          endTime = 1100000,
          success = true
        })
        expect(#result).toBe(2)
      end)
      
      it("should return all logs with empty filters", function()
        local result = applyFilters.applyFilters(logs, {})
        expect(#result).toBe(5)
      end)
      
      it("should handle nil filters", function()
        local result = applyFilters.applyFilters(logs, nil)
        expect(#result).toBe(5)
      end)
    end)
    
    describe("getFilterOptions", function()
      local logs
      
      beforeEach(function()
        logs = createSampleLogs()
      end)
      
      it("should extract unique operations", function()
        local options = getFilterOptions.getFilterOptions(logs)
        expect(#options.operations).toBe(4)
        -- Should be sorted alphabetically
        expect(options.operations[1]).toBe("create")
        expect(options.operations[2]).toBe("delete")
        expect(options.operations[3]).toBe("read")
        expect(options.operations[4]).toBe("update")
      end)
      
      it("should extract unique resources", function()
        local options = getFilterOptions.getFilterOptions(logs)
        expect(#options.resources).toBe(3)
        expect(options.resources[1]).toBe("post")
        expect(options.resources[2]).toBe("settings")
        expect(options.resources[3]).toBe("user")
      end)
      
      it("should extract unique usernames", function()
        local options = getFilterOptions.getFilterOptions(logs)
        expect(#options.usernames).toBe(4)
        -- Sorted: Admin_User, admin, editor, viewer
        expect(options.usernames[1]).toBe("Admin_User")
        expect(options.usernames[2]).toBe("admin")
      end)
      
      it("should return empty arrays for nil logs", function()
        local options = getFilterOptions.getFilterOptions(nil)
        expect(#options.operations).toBe(0)
        expect(#options.resources).toBe(0)
        expect(#options.usernames).toBe(0)
      end)
      
      it("should return empty arrays for empty logs", function()
        local options = getFilterOptions.getFilterOptions({})
        expect(#options.operations).toBe(0)
        expect(#options.resources).toBe(0)
        expect(#options.usernames).toBe(0)
      end)
    end)
    
  end)
end

return M
