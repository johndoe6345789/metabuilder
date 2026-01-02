-- Sorting Tests
-- Parameterized tests for data table sorting functions

local describe = require("lua_test.describe")
local it = require("lua_test.it")
local it_each = require("lua_test.it_each")
local expect = require("lua_test.expect")
local beforeEach = require("lua_test.beforeEach")

local cases = require("tests.sorting.cases")
local compare = require("sorting.compare")
local sortByColumn = require("sorting.sort_by_column")
local toggleSort = require("sorting.toggle_sort")
local createSortState = require("sorting.create_sort_state")

describe("sorting", function()

  describe("compare", function()
    describe("numbers", function()
      it_each(cases.compare.numbers.asc, "$a vs $b (asc) should be $expected", function(case)
        local result = compare.compare(case.a, case.b, "asc")
        expect(result).toBe(case.expected)
      end)

      it_each(cases.compare.numbers.desc, "$a vs $b (desc) should be $expected", function(case)
        local result = compare.compare(case.a, case.b, "desc")
        expect(result).toBe(case.expected)
      end)
    end)

    describe("strings", function()
      it_each(cases.compare.strings.asc, "'$a' vs '$b' (asc) should be $expected", function(case)
        local result = compare.compare(case.a, case.b, "asc")
        expect(result).toBe(case.expected)
      end)

      it_each(cases.compare.strings.desc, "'$a' vs '$b' (desc) should be $expected", function(case)
        local result = compare.compare(case.a, case.b, "desc")
        expect(result).toBe(case.expected)
      end)
    end)

    describe("nil handling", function()
      it_each(cases.compare.nil_values, "$description", function(case)
        local result = compare.compare(case.a, case.b, case.direction)
        expect(result).toBe(case.expected)
      end)
    end)

    describe("mixed types", function()
      it_each(cases.compare.mixed_types, "$a ($aType) vs $b ($bType)", function(case)
        local result = compare.compare(case.a, case.b, "asc")
        expect(result).toBe(case.expected)
      end)
    end)
  end)

  describe("createSortState", function()
    it("should create default sort state", function()
      local state = createSortState.createSortState()
      expect(state.column).toBe(nil)
      expect(state.direction).toBe("asc")
    end)

    it_each(cases.createSortState.withOptions, "should create state with $column/$direction", function(case)
      local state = createSortState.createSortState(case.column, case.direction)
      expect(state.column).toBe(case.column)
      expect(state.direction).toBe(case.direction)
    end)
  end)

  describe("toggleSort", function()
    it_each(cases.toggleSort.scenarios, "$description", function(case)
      local state = { column = case.currentColumn, direction = case.currentDirection }
      local result = toggleSort.toggleSort(state, case.clickedColumn)
      expect(result.column).toBe(case.expectedColumn)
      expect(result.direction).toBe(case.expectedDirection)
    end)
  end)

  describe("sortByColumn", function()
    it_each(cases.sortByColumn.scenarios, "$description", function(case)
      local state = { column = case.column, direction = case.direction }
      local result = sortByColumn.sortByColumn(case.data, state)
      
      -- Verify order
      for i, expectedId in ipairs(case.expectedOrder) do
        expect(result[i].id).toBe(expectedId)
      end
    end)

    it("should not mutate original data", function()
      local data = {{ id = 2, val = 20 }, { id = 1, val = 10 }}
      local state = { column = "val", direction = "asc" }
      sortByColumn.sortByColumn(data, state)
      expect(data[1].id).toBe(2) -- original unchanged
    end)
  end)

end)

return {
  name = "sorting.test",
  description = "Tests for data table sorting"
}
