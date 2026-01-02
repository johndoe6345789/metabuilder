-- Filtering Tests
-- Parameterized tests for data table filtering functions

local describe = require("lua_test.describe")
local it = require("lua_test.it")
local it_each = require("lua_test.it_each")
local expect = require("lua_test.expect")
local beforeEach = require("lua_test.beforeEach")

local cases = require("tests.filtering.cases")
local matchesFilter = require("filtering.matches_filter")
local applyFilters = require("filtering.apply_filters")
local matchesAllFilters = require("filtering.matches_all_filters")

describe("filtering", function()

  describe("matchesFilter", function()
    describe("equals operator", function()
      it_each(cases.matchesFilter.equals.matches, "should match $value == $filterValue", function(case)
        local filter = { operator = "equals", value = case.filterValue }
        local result = matchesFilter.matchesFilter(case.value, filter)
        expect(result).toBe(true)
      end)

      it_each(cases.matchesFilter.equals.no_match, "should not match $value == $filterValue", function(case)
        local filter = { operator = "equals", value = case.filterValue }
        local result = matchesFilter.matchesFilter(case.value, filter)
        expect(result).toBe(false)
      end)
    end)

    describe("contains operator", function()
      it_each(cases.matchesFilter.contains.matches, "should find '$filterValue' in '$value'", function(case)
        local filter = { operator = "contains", value = case.filterValue }
        local result = matchesFilter.matchesFilter(case.value, filter)
        expect(result).toBe(true)
      end)

      it_each(cases.matchesFilter.contains.no_match, "should not find '$filterValue' in '$value'", function(case)
        local filter = { operator = "contains", value = case.filterValue }
        local result = matchesFilter.matchesFilter(case.value, filter)
        expect(result).toBe(false)
      end)
    end)

    describe("startsWith operator", function()
      it_each(cases.matchesFilter.startsWith.matches, "'$value' should start with '$filterValue'", function(case)
        local filter = { operator = "startsWith", value = case.filterValue }
        local result = matchesFilter.matchesFilter(case.value, filter)
        expect(result).toBe(true)
      end)

      it_each(cases.matchesFilter.startsWith.no_match, "'$value' should not start with '$filterValue'", function(case)
        local filter = { operator = "startsWith", value = case.filterValue }
        local result = matchesFilter.matchesFilter(case.value, filter)
        expect(result).toBe(false)
      end)
    end)

    describe("endsWith operator", function()
      it_each(cases.matchesFilter.endsWith.matches, "'$value' should end with '$filterValue'", function(case)
        local filter = { operator = "endsWith", value = case.filterValue }
        local result = matchesFilter.matchesFilter(case.value, filter)
        expect(result).toBe(true)
      end)

      it_each(cases.matchesFilter.endsWith.no_match, "'$value' should not end with '$filterValue'", function(case)
        local filter = { operator = "endsWith", value = case.filterValue }
        local result = matchesFilter.matchesFilter(case.value, filter)
        expect(result).toBe(false)
      end)
    end)

    describe("numeric operators", function()
      it_each(cases.matchesFilter.numeric.gt, "$value > $filterValue should be $expected", function(case)
        local filter = { operator = "gt", value = case.filterValue }
        local result = matchesFilter.matchesFilter(case.value, filter)
        expect(result).toBe(case.expected)
      end)

      it_each(cases.matchesFilter.numeric.lt, "$value < $filterValue should be $expected", function(case)
        local filter = { operator = "lt", value = case.filterValue }
        local result = matchesFilter.matchesFilter(case.value, filter)
        expect(result).toBe(case.expected)
      end)

      it_each(cases.matchesFilter.numeric.gte, "$value >= $filterValue should be $expected", function(case)
        local filter = { operator = "gte", value = case.filterValue }
        local result = matchesFilter.matchesFilter(case.value, filter)
        expect(result).toBe(case.expected)
      end)

      it_each(cases.matchesFilter.numeric.lte, "$value <= $filterValue should be $expected", function(case)
        local filter = { operator = "lte", value = case.filterValue }
        local result = matchesFilter.matchesFilter(case.value, filter)
        expect(result).toBe(case.expected)
      end)

      it_each(cases.matchesFilter.numeric.between, "$value between $range should be $expected", function(case)
        local filter = { operator = "between", value = case.range }
        local result = matchesFilter.matchesFilter(case.value, filter)
        expect(result).toBe(case.expected)
      end)
    end)

    describe("nil handling", function()
      it_each(cases.matchesFilter.nil_values, "$description", function(case)
        local filter = { operator = case.operator, value = case.filterValue }
        local result = matchesFilter.matchesFilter(case.value, filter)
        expect(result).toBe(case.expected)
      end)
    end)
  end)

  describe("applyFilters", function()
    it_each(cases.applyFilters.scenarios, "$description", function(case)
      local state = { filters = case.filters }
      local result = applyFilters.applyFilters(case.data, state)
      expect(#result).toBe(case.expectedCount)
      if case.expectedIds then
        for i, id in ipairs(case.expectedIds) do
          expect(result[i].id).toBe(id)
        end
      end
    end)

    it("should return original data with empty filters", function()
      local data = {{ id = 1 }, { id = 2 }}
      local state = { filters = {} }
      local result = applyFilters.applyFilters(data, state)
      expect(#result).toBe(2)
    end)

    it("should not mutate original data", function()
      local data = {{ id = 1, value = 10 }, { id = 2, value = 20 }}
      local state = { filters = {{ column = "value", operator = "gt", value = 15 }} }
      applyFilters.applyFilters(data, state)
      expect(#data).toBe(2)
    end)
  end)

end)

return {
  name = "filtering.test",
  description = "Tests for data table filtering"
}
