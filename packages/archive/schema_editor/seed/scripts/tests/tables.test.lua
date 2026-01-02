-- Tables tests for schema_editor package
-- Tests table CRUD actions

local tables = require("tables")

describe("Schema Tables", function()
  describe("create", function()
    it.each({
      { name = "users", fields = nil, expectedFields = 0, desc = "without fields" },
      { name = "posts", fields = {}, expectedFields = 0, desc = "with empty fields" },
    })("should create table $desc", function(testCase)
      local result = tables.create(testCase.name, testCase.fields)
      expect(result.action).toBe("create_table")
      expect(result.name).toBe(testCase.name)
      expect(#result.fields).toBe(testCase.expectedFields)
    end)

    it("should create table with fields", function()
      local fields = {
        { type = "string", name = "email" },
        { type = "number", name = "age" }
      }
      local result = tables.create("users", fields)
      expect(result.action).toBe("create_table")
      expect(#result.fields).toBe(2)
      expect(result.fields[1].name).toBe("email")
    end)
  end)

  describe("render", function()
    it("should render table editor component", function()
      local table_def = {
        name = "products",
        fields = { { type = "string", name = "title" } }
      }
      local result = tables.render(table_def)
      expect(result.type).toBe("table_editor")
      expect(result.props.name).toBe("products")
      expect(#result.props.fields).toBe(1)
    end)
  end)

  describe("add_field", function()
    it("should create add field action", function()
      local field = { type = "string", name = "description" }
      local result = tables.add_field("products", field)
      expect(result.action).toBe("add_field")
      expect(result.table).toBe("products")
      expect(result.field.name).toBe("description")
    end)
  end)

  describe("remove_field", function()
    it("should create remove field action", function()
      local result = tables.remove_field("products", "description")
      expect(result.action).toBe("remove_field")
      expect(result.table).toBe("products")
      expect(result.field).toBe("description")
    end)
  end)
end)
