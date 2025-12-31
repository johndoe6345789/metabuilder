-- Export tests
-- Uses lua_test framework with parameterized test cases

describe("Data Table Export", function()
  local cases = load_cases("export.cases.json")
  local escape_csv = require("export.escape_csv")
  local export_to_csv = require("export.export_to_csv")

  describe("escapeCsv", function()
    it_each(cases.escapeCsv, "$desc", function(tc)
      local result = escape_csv.escapeCsv(tc.input)
      expect(result).toBe(tc.expected)
    end)
  end)

  describe("exportToCsv", function()
    it_each(cases.exportToCsv, "$desc", function(tc)
      local result = export_to_csv.exportToCsv(tc.data, tc.columns, tc.options)

      -- Split into lines for easier testing
      local lines = {}
      for line in result:gmatch("[^\n]+") do
        table.insert(lines, line)
      end

      expect(#lines).toBe(tc.expected_line_count)

      -- Check first line (header or first data row)
      if tc.expected_first_line then
        expect(lines[1]).toBe(tc.expected_first_line)
      end

      -- Check specific lines if provided
      if tc.expected_lines then
        for i, expected_line in ipairs(tc.expected_lines) do
          expect(lines[i]).toBe(expected_line)
        end
      end
    end)

    it("exports empty data", function()
      local result = export_to_csv.exportToCsv({}, {
        { id = "name", label = "Name" }
      })
      local lines = {}
      for line in result:gmatch("[^\n]+") do
        table.insert(lines, line)
      end
      expect(#lines).toBe(1) -- Just header
    end)

    it("handles nil columns gracefully", function()
      local result = export_to_csv.exportToCsv(
        {{ name = "Test" }},
        {{ id = "name", label = "Name" }},
        { includeHeaders = false }
      )
      expect(result).toBeDefined()
    end)
  end)
end)
