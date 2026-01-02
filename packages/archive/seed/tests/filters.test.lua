-- Tests for audit_log filter functions
-- Uses lua_test framework with parameterized test cases

local M = {}

-- Sample audit log data for testing
---@class AuditLogEntry
---@field id string
---@field operation string
---@field resource string
---@field resourceId string
---@field username string
---@field timestamp number
---@field ipAddress string
---@field success boolean
---@field errorMessage string|nil

---@class FilterOptions
---@field operations string[]
---@field resources string[]
---@field usernames string[]

---@class ApplyFiltersInput
---@field operation string|nil
---@field resource string|nil
---@field success boolean|nil
---@field username string|nil
---@field startTime number|nil
---@field endTime number|nil

---@class FilterByOperationCase
---@field operation string|nil
---@field expected integer
---@field desc string

---@class FilterByResourceCase
---@field resource string|nil
---@field expected integer
---@field desc string

---@class FilterBySuccessCase
---@field success boolean|nil
---@field expected integer
---@field desc string
---@field expectedId string|nil

---@class FilterByUsernameCase
---@field username string|nil
---@field expected integer
---@field desc string

---@class FilterByDateRangeCase
---@field startTime number|nil
---@field endTime number|nil
---@field expected integer
---@field desc string

---@class ApplyFiltersCase
---@field filters ApplyFiltersInput|nil
---@field expected integer
---@field desc string
---@field expectedFirstId string|nil

---@return AuditLogEntry[]
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
  ---@type { filter_by_operation: FilterByOperationCase[], filter_by_resource: FilterByResourceCase[], filter_by_success: FilterBySuccessCase[], filter_by_username: FilterByUsernameCase[], filter_by_date_range: FilterByDateRangeCase[], apply_filters: ApplyFiltersCase[] }
  local cases = load_cases("filters.cases.json")
  
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
      ---@type AuditLogEntry[]
      local logs
      
      beforeEach(function()
        logs = createSampleLogs()
      end)
      
      it_each(cases.filter_by_operation, "$desc", function(testCase)
        ---@type FilterByOperationCase
        local tc = testCase
        local result = filterByOperation.filterByOperation(logs, tc.operation)
        expect(#result).toBe(tc.expected)
      end)
      
      it("should return empty array when logs is nil", function()
        local result = filterByOperation.filterByOperation(nil, "create")
        expect(#result).toBe(0)
      end)
    end)
    
    describe("filterByResource", function()
      ---@type AuditLogEntry[]
      local logs
      
      beforeEach(function()
        logs = createSampleLogs()
      end)
      
      it_each(cases.filter_by_resource, "$desc", function(testCase)
        ---@type FilterByResourceCase
        local tc = testCase
        local result = filterByResource.filterByResource(logs, tc.resource)
        expect(#result).toBe(tc.expected)
      end)
      
    end)
    
    describe("filterBySuccess", function()
      ---@type AuditLogEntry[]
      local logs
      
      beforeEach(function()
        logs = createSampleLogs()
      end)
      
      it_each(cases.filter_by_success, "$desc", function(testCase)
        ---@type FilterBySuccessCase
        local tc = testCase
        local result = filterBySuccess.filterBySuccess(logs, tc.success)
        expect(#result).toBe(tc.expected)
        if tc.expectedId then
          expect(result[1].id).toBe(tc.expectedId)
        end
      end)
      
    end)
    
    describe("filterByUsername", function()
      ---@type AuditLogEntry[]
      local logs
      
      beforeEach(function()
        logs = createSampleLogs()
      end)
      
      it_each(cases.filter_by_username, "$desc", function(testCase)
        ---@type FilterByUsernameCase
        local tc = testCase
        local result = filterByUsername.filterByUsername(logs, tc.username)
        expect(#result).toBe(tc.expected)
      end)
      
    end)
    
    describe("filterByDateRange", function()
      ---@type AuditLogEntry[]
      local logs
      
      beforeEach(function()
        logs = createSampleLogs()
      end)
      
      it_each(cases.filter_by_date_range, "$desc", function(testCase)
        ---@type FilterByDateRangeCase
        local tc = testCase
        local result = filterByDateRange.filterByDateRange(logs, tc.startTime, tc.endTime)
        expect(#result).toBe(tc.expected)
      end)
    end)
    
    describe("applyFilters", function()
      ---@type AuditLogEntry[]
      local logs
      
      beforeEach(function()
        logs = createSampleLogs()
      end)
      
      it_each(cases.apply_filters, "$desc", function(testCase)
        ---@type ApplyFiltersCase
        local tc = testCase
        local result = applyFilters.applyFilters(logs, tc.filters)
        expect(#result).toBe(tc.expected)
        if tc.expectedFirstId then
          expect(result[1].id).toBe(tc.expectedFirstId)
        end
      end)
      
    end)
    
    describe("getFilterOptions", function()
      ---@type AuditLogEntry[]
      local logs
      
      beforeEach(function()
        logs = createSampleLogs()
      end)
      
      it("should extract unique operations", function()
        ---@type FilterOptions
        local options = getFilterOptions.getFilterOptions(logs)
        expect(#options.operations).toBe(4)
        -- Should be sorted alphabetically
        expect(options.operations[1]).toBe("create")
        expect(options.operations[2]).toBe("delete")
        expect(options.operations[3]).toBe("read")
        expect(options.operations[4]).toBe("update")
      end)
      
      it("should extract unique resources", function()
        ---@type FilterOptions
        local options = getFilterOptions.getFilterOptions(logs)
        expect(#options.resources).toBe(3)
        expect(options.resources[1]).toBe("post")
        expect(options.resources[2]).toBe("settings")
        expect(options.resources[3]).toBe("user")
      end)
      
      it("should extract unique usernames", function()
        ---@type FilterOptions
        local options = getFilterOptions.getFilterOptions(logs)
        expect(#options.usernames).toBe(4)
        -- Sorted: Admin_User, admin, editor, viewer
        expect(options.usernames[1]).toBe("Admin_User")
        expect(options.usernames[2]).toBe("admin")
      end)
      
      it("should return empty arrays for nil logs", function()
        ---@type FilterOptions
        local options = getFilterOptions.getFilterOptions(nil)
        expect(#options.operations).toBe(0)
        expect(#options.resources).toBe(0)
        expect(#options.usernames).toBe(0)
      end)
      
      it("should return empty arrays for empty logs", function()
        ---@type FilterOptions
        local options = getFilterOptions.getFilterOptions({})
        expect(#options.operations).toBe(0)
        expect(#options.resources).toBe(0)
        expect(#options.usernames).toBe(0)
      end)
    end)
    
  end)
end

return M
