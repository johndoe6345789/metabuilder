-- Metadata validation tests for schema_validator package
local metadata_schema = require("metadata_schema")

describe("Metadata Schema Validation", function()
  it("should validate a complete valid metadata", function()
    local valid_metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "A test package",
      author = "MetaBuilder",
      category = "test",
      dependencies = {},
      exports = {
        components = {},
        scripts = {}
      },
      minLevel = 1
    }

    local valid, errors = metadata_schema.validate_metadata(valid_metadata)
    expect(valid).toBe(true)
    expect(#errors).toBe(0)
  end)

  it("should fail when packageId is missing", function()
    local invalid_metadata = {
      name = "Test Package",
      version = "1.0.0",
      description = "A test package",
      author = "MetaBuilder",
      category = "test"
    }

    local valid, errors = metadata_schema.validate_metadata(invalid_metadata)
    expect(valid).toBe(false)
    expect(#errors).toBeGreaterThan(0)
  end)

  it("should fail when packageId has uppercase letters", function()
    local invalid_metadata = {
      packageId = "TestPackage",
      name = "Test Package",
      version = "1.0.0",
      description = "A test package",
      author = "MetaBuilder",
      category = "test"
    }

    local valid, errors = metadata_schema.validate_metadata(invalid_metadata)
    expect(valid).toBe(false)
  end)

  it("should fail when version is not semantic", function()
    local invalid_metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0",
      description = "A test package",
      author = "MetaBuilder",
      category = "test"
    }

    local valid, errors = metadata_schema.validate_metadata(invalid_metadata)
    expect(valid).toBe(false)
  end)

  it("should fail when minLevel is out of range", function()
    local invalid_metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "A test package",
      author = "MetaBuilder",
      category = "test",
      minLevel = 10
    }

    local valid, errors = metadata_schema.validate_metadata(invalid_metadata)
    expect(valid).toBe(false)
  end)

  it("should validate optional bindings field", function()
    local valid_metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "A test package",
      author = "MetaBuilder",
      category = "test",
      bindings = {
        dbal = true,
        browser = false
      }
    }

    local valid, errors = metadata_schema.validate_metadata(valid_metadata)
    expect(valid).toBe(true)
  end)

  it("should fail when bindings.dbal is not boolean", function()
    local invalid_metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "A test package",
      author = "MetaBuilder",
      category = "test",
      bindings = {
        dbal = "yes"
      }
    }

    local valid, errors = metadata_schema.validate_metadata(invalid_metadata)
    expect(valid).toBe(false)
  end)
end)
