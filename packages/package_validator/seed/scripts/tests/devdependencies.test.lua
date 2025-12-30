-- DevDependencies validation tests
local structure_validator = require("structure_validator")

describe("DevDependencies Validation", function()
  it("should not require tests when lua_test is absent", function()
    local metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "Test",
      author = "Test",
      category = "test",
      dependencies = [],
      exports = {
        scripts = ["init"]
      }
    }

    local errors, warnings = structure_validator.validate_test_structure("packages/test_package/seed", metadata)

    -- Should not have errors or warnings about missing tests
    expect(#errors).toBe(0)
    expect(#warnings).toBe(0)
  end)

  it("should warn about missing tests when lua_test is a devDependency", function()
    local metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "Test",
      author = "Test",
      category = "test",
      dependencies = [],
      devDependencies = ["lua_test"],
      exports = {
        scripts = ["init"]
      }
    }

    local errors, warnings = structure_validator.validate_test_structure("packages/test_package/seed", metadata)

    -- Should warn about missing test files
    expect(#warnings).toBeGreaterThan(0)
  end)

  it("should accept valid devDependencies array", function()
    local metadata_schema = require("metadata_schema")

    local metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "Test",
      author = "Test",
      category = "test",
      devDependencies = ["lua_test", "package_validator"]
    }

    local valid, errors = metadata_schema.validate_metadata(metadata)
    expect(valid).toBe(true)
  end)

  it("should fail when devDependencies is not an array", function()
    local metadata_schema = require("metadata_schema")

    local metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "Test",
      author = "Test",
      category = "test",
      devDependencies = "lua_test"  -- Should be array
    }

    local valid, errors = metadata_schema.validate_metadata(metadata)
    expect(valid).toBe(false)
  end)

  it("should recommend test files when lua_test is present", function()
    local metadata = {
      packageId = "admin_dialog",
      name = "Admin Dialog",
      version = "1.0.0",
      description = "Test",
      author = "Test",
      category = "test",
      devDependencies = ["lua_test"],
      exports = {
        scripts = ["init"]
      }
    }

    local errors, warnings = structure_validator.validate_scripts_structure("packages/admin_dialog/seed", metadata)

    -- Should check for test files when lua_test is present
    expect(errors).toBeTruthy()
    expect(warnings).toBeTruthy()
  end)
end)
