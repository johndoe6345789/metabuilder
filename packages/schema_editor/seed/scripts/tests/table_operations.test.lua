-- Schema table operations tests
-- Uses lua_test framework with parameterized test cases

describe("Schema Tables", function()
  local cases = load_cases("table_operations.cases.json")
  local tables = require("tables")

  describe("create", function()
    it_each(cases.create, "$desc", function(tc)
      local result = tables.create(tc.name, tc.fields)
      expect(result.action).toBe("create_table")
      expect(result.name).toBe(tc.name)
      if tc.expected_fields_count ~= nil then
        expect(#result.fields).toBe(tc.expected_fields_count)
      end
    end)
  end)

  describe("render", function()
    it_each(cases.render, "$desc", function(tc)
      local result = tables.render(tc.input)
      expect(result.type).toBe("table_editor")
      expect(result.props.name).toBe(tc.expected_name)
      expect(#result.props.fields).toBe(tc.expected_fields_count)
    end)
  end)

  describe("add_field", function()
    it_each(cases.add_field, "$desc", function(tc)
      local result = tables.add_field(tc.table_name, tc.field)
      expect(result.action).toBe("add_field")
      expect(result.table).toBe(tc.table_name)
      expect(result.field).toBeDefined()
      expect(result.field.name).toBe(tc.field.name)
      expect(result.field.type).toBe(tc.field.type)
    end)
  end)

  describe("remove_field", function()
    it_each(cases.remove_field, "$desc", function(tc)
      local result = tables.remove_field(tc.table_name, tc.field_name)
      expect(result.action).toBe("remove_field")
      expect(result.table).toBe(tc.table_name)
      expect(result.field).toBe(tc.field_name)
    end)
  end)
end)
