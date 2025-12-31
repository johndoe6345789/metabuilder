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

  -- Tests for primary flag
  it("should validate primary: true", function()
    local valid_metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "A test package",
      author = "MetaBuilder",
      category = "test",
      primary = true
    }

    local valid, errors = metadata_schema.validate_metadata(valid_metadata)
    expect(valid).toBe(true)
  end)

  it("should validate primary: false", function()
    local valid_metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "A test package",
      author = "MetaBuilder",
      category = "test",
      primary = false
    }

    local valid, errors = metadata_schema.validate_metadata(valid_metadata)
    expect(valid).toBe(true)
  end)

  it("should fail when primary is not boolean", function()
    local invalid_metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "A test package",
      author = "MetaBuilder",
      category = "test",
      primary = "yes"
    }

    local valid, errors = metadata_schema.validate_metadata(invalid_metadata)
    expect(valid).toBe(false)
  end)

  -- Tests for permissions
  it("should validate valid permissions", function()
    local valid_metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "A test package",
      author = "MetaBuilder",
      category = "test",
      permissions = {
        ["test.read"] = { minLevel = 1, description = "Read test data" },
        ["test.write"] = { minLevel = 2, description = "Write test data" }
      }
    }

    local valid, errors = metadata_schema.validate_metadata(valid_metadata)
    expect(valid).toBe(true)
  end)

  it("should fail when permission key is invalid", function()
    local invalid_metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "A test package",
      author = "MetaBuilder",
      category = "test",
      permissions = {
        ["Test.Read"] = { minLevel = 1, description = "Read test data" }
      }
    }

    local valid, errors = metadata_schema.validate_metadata(invalid_metadata)
    expect(valid).toBe(false)
  end)

  it("should fail when permission minLevel is missing", function()
    local invalid_metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "A test package",
      author = "MetaBuilder",
      category = "test",
      permissions = {
        ["test.read"] = { description = "Read test data" }
      }
    }

    local valid, errors = metadata_schema.validate_metadata(invalid_metadata)
    expect(valid).toBe(false)
  end)

  it("should fail when permission description is missing", function()
    local invalid_metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "A test package",
      author = "MetaBuilder",
      category = "test",
      permissions = {
        ["test.read"] = { minLevel = 1 }
      }
    }

    local valid, errors = metadata_schema.validate_metadata(invalid_metadata)
    expect(valid).toBe(false)
  end)

  it("should validate permissions with featureFlags", function()
    local valid_metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "A test package",
      author = "MetaBuilder",
      category = "test",
      permissions = {
        ["test.advanced"] = {
          minLevel = 3,
          description = "Advanced features",
          featureFlags = { "beta_features", "advanced_mode" }
        }
      }
    }

    local valid, errors = metadata_schema.validate_metadata(valid_metadata)
    expect(valid).toBe(true)
  end)

  it("should validate permissions with requireDatabase", function()
    local valid_metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "A test package",
      author = "MetaBuilder",
      category = "test",
      permissions = {
        ["test.db_action"] = {
          minLevel = 2,
          description = "Database action",
          requireDatabase = true
        }
      }
    }

    local valid, errors = metadata_schema.validate_metadata(valid_metadata)
    expect(valid).toBe(true)
  end)

  it("should allow minLevel 0 for public permissions", function()
    local valid_metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "A test package",
      author = "MetaBuilder",
      category = "test",
      minLevel = 0,
      permissions = {
        ["test.public"] = { minLevel = 0, description = "Public action" }
      }
    }

    local valid, errors = metadata_schema.validate_metadata(valid_metadata)
    expect(valid).toBe(true)
  end)
end)
