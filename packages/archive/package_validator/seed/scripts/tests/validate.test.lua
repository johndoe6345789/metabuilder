-- Integration tests for schema validation
local validate = require("validate")

describe("Schema Validator Integration", function()
  it("should format validation results for valid package", function()
    local results = {
      valid = true,
      errors = {},
      warnings = {}
    }

    local formatted = validate.format_results(results)
    expect(formatted).toContain("✓ Validation passed")
  end)

  it("should format validation results with errors", function()
    local results = {
      valid = false,
      errors = {
        "Missing required field: packageId",
        "Invalid version format"
      },
      warnings = {}
    }

    local formatted = validate.format_results(results)
    expect(formatted).toContain("✗ Validation failed")
    expect(formatted).toContain("Errors:")
    expect(formatted).toContain("Missing required field: packageId")
  end)

  it("should format validation results with warnings", function()
    local results = {
      valid = true,
      errors = {},
      warnings = {
        "components.json not found (optional)"
      }
    }

    local formatted = validate.format_results(results)
    expect(formatted).toContain("✓ Validation passed")
    expect(formatted).toContain("Warnings:")
  end)

  it("should validate metadata only", function()
    local metadata = {
      packageId = "schema_validator",
      name = "Schema Validator",
      version = "1.0.0",
      description = "Validates JSON schemas",
      author = "MetaBuilder",
      category = "tools"
    }

    local valid, errors = validate.validate_metadata_only(metadata)
    expect(valid).toBe(true)
  end)

  it("should validate components only", function()
    local components = {
      {
        id = "test_comp",
        type = "TestComponent"
      }
    }

    local valid, errors = validate.validate_components_only(components)
    expect(valid).toBe(true)
  end)
end)
