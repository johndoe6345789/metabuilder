-- Selection tests
-- Uses lua_test framework with parameterized test cases

describe("Data Table Selection", function()
  local cases = load_cases("selection.cases.json")
  local toggle_row = require("selection.toggle_row")
  local select_range = require("selection.select_range")

  describe("toggleRow", function()
    it_each(cases.toggleRow.single_mode, "$desc", function(tc)
      local state = {
        selected = tc.initial_selected,
        mode = "single"
      }
      local result = toggle_row.toggleRow(state, tc.index)
      expect(result.mode).toBe("single")
      expect(result.lastSelected).toBe(tc.index)

      -- Check selected state
      for idx, should_be_selected in pairs(tc.expected_selected) do
        if should_be_selected then
          expect(result.selected[idx]).toBe(true)
        else
          expect(result.selected[idx]).toBeNil()
        end
      end
    end)

    it_each(cases.toggleRow.multiple_mode, "$desc", function(tc)
      local state = {
        selected = tc.initial_selected,
        mode = "multiple"
      }
      local result = toggle_row.toggleRow(state, tc.index)
      expect(result.mode).toBe("multiple")
      expect(result.lastSelected).toBe(tc.index)

      -- Check selected state
      for idx, should_be_selected in pairs(tc.expected_selected) do
        if should_be_selected then
          expect(result.selected[idx]).toBe(true)
        else
          expect(result.selected[idx]).toBeNil()
        end
      end
    end)
  end)

  describe("selectRange", function()
    it_each(cases.selectRange, "$desc", function(tc)
      local state = {
        selected = tc.initial_selected,
        mode = "multiple"
      }
      local result = select_range.selectRange(state, tc.from_index, tc.to_index)
      expect(result.lastSelected).toBe(tc.to_index)

      -- Check all expected indices are selected
      for idx = tc.expected_start, tc.expected_end do
        expect(result.selected[idx]).toBe(true)
      end

      -- Check preserved selections
      if tc.preserve_indices then
        for _, idx in ipairs(tc.preserve_indices) do
          expect(result.selected[idx]).toBe(true)
        end
      end
    end)
  end)
end)
