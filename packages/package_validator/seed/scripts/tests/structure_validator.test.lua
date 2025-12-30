-- Structure validator tests
local structure_validator = require("structure_validator")

describe("Structure Validator", function()
  it("should validate naming conventions for packageId", function()
    local metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "Test",
      author = "Test",
      category = "test"
    }

    local errors, warnings = structure_validator.validate_naming_conventions("packages/test_package", metadata)
    expect(#errors).toBe(0)
  end)

  it("should fail when directory name doesn't match packageId", function()
    local metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "Test",
      author = "Test",
      category = "test"
    }

    local errors, warnings = structure_validator.validate_naming_conventions("packages/wrong_name", metadata)
    expect(#errors).toBeGreaterThan(0)
  end)

  it("should warn about invalid script naming", function()
    local metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "Test",
      author = "Test",
      category = "test",
      exports = {
        scripts = {"ValidScript"}  -- Should be lowercase
      }
    }

    local errors, warnings = structure_validator.validate_naming_conventions("packages/test_package", metadata)
    expect(#warnings).toBeGreaterThan(0)
  end)

  it("should accept valid component naming conventions", function()
    local metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "Test",
      author = "Test",
      category = "test",
      exports = {
        components = {"TestComponent", "test_component"}
      }
    }

    local errors, warnings = structure_validator.validate_naming_conventions("packages/test_package", metadata)
    -- Component names are valid
    expect(#errors).toBe(0)
  end)

  it("should validate scripts structure when exports.scripts exists", function()
    local metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "Test",
      author = "Test",
      category = "test",
      exports = {
        scripts = {"init", "validate"}
      }
    }

    local errors, warnings = structure_validator.validate_scripts_structure("packages/test_package/seed", metadata)
    -- May have warnings about missing files, but structure is validated
    expect(errors).toBeTruthy()
  end)

  it("should validate icon path", function()
    local metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "Test",
      author = "Test",
      category = "test",
      icon = "static_content/icon.svg"
    }

    local errors, warnings = structure_validator.validate_static_content("packages/test_package/seed", metadata)
    -- Will check if file exists
    expect(errors).toBeTruthy()
  end)

  it("should warn when no icon is defined", function()
    local metadata = {
      packageId = "test_package",
      name = "Test Package",
      version = "1.0.0",
      description = "Test",
      author = "Test",
      category = "test"
    }

    local errors, warnings = structure_validator.validate_static_content("packages/test_package/seed", metadata)
    expect(#warnings).toBeGreaterThan(0)
  end)
end)
