-- Relations tests for schema_editor package
-- Tests relationship definitions

local relations = require("relations")

describe("Schema Relations", function()
  describe("constants", function()
    it("should have relation type constants", function()
      expect(relations.ONE_TO_ONE).toBe("one_to_one")
      expect(relations.ONE_TO_MANY).toBe("one_to_many")
      expect(relations.MANY_TO_MANY).toBe("many_to_many")
    end)
  end)

  describe("define", function()
    it.each({
      { type = "one_to_one", cascade = nil, expectedCascade = false },
      { type = "one_to_many", cascade = true, expectedCascade = true },
      { type = "many_to_many", cascade = false, expectedCascade = false },
    })("should define $type relationship with cascade=$expectedCascade", function(testCase)
      local from = { table = "users", field = "id" }
      local to = { table = "profiles", field = "user_id" }
      local options = testCase.cascade ~= nil and { cascade = testCase.cascade } or nil
      
      local result = relations.define(testCase.type, from, to, options)
      expect(result.type).toBe(testCase.type)
      expect(result.from_table).toBe("users")
      expect(result.from_field).toBe("id")
      expect(result.to_table).toBe("profiles")
      expect(result.to_field).toBe("user_id")
      expect(result.cascade).toBe(testCase.expectedCascade)
    end)
  end)

  describe("has_one", function()
    it("should create one-to-one relationship", function()
      local from = { table = "users", field = "id" }
      local to = { table = "profiles", field = "user_id" }
      
      local result = relations.has_one(from, to)
      expect(result.type).toBe("one_to_one")
      expect(result.from_table).toBe("users")
      expect(result.to_table).toBe("profiles")
    end)
  end)

  describe("has_many", function()
    it("should create one-to-many relationship", function()
      local from = { table = "users", field = "id" }
      local to = { table = "posts", field = "author_id" }
      
      local result = relations.has_many(from, to)
      expect(result.type).toBe("one_to_many")
      expect(result.from_table).toBe("users")
      expect(result.to_table).toBe("posts")
    end)
  end)

  describe("belongs_to_many", function()
    it("should create many-to-many relationship with pivot", function()
      local from = { table = "users", field = "id" }
      local to = { table = "roles", field = "id" }
      
      local result = relations.belongs_to_many(from, to, "user_roles")
      expect(result.type).toBe("many_to_many")
      expect(result.pivot_table).toBe("user_roles")
    end)
  end)
end)
