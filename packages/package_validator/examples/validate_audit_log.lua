-- Example: Validate the audit_log package
-- This demonstrates how to use the package_validator package

local package_validator = require("init")
local validate = require("validate")

print("=== Package Validator Demo ===\n")

-- Example 1: Validate a complete package
print("1. Validating audit_log package...")
local results = package_validator.validate_package("audit_log")
print(validate.format_results(results))
print()

-- Example 2: Validate just metadata
print("2. Validating metadata only...")
local metadata = {
  packageId = "package_validator",
  name = "Package Validator",
  version = "1.0.0",
  description = "Validates JSON schemas for package metadata, components, and configuration files",
  icon = "static_content/icon.svg",
  author = "MetaBuilder",
  category = "tools",
  dependencies = {},
  exports = {
    components = {},
    scripts = {"validate", "metadata_schema", "component_schema"}
  },
  minLevel = 5
}

local valid, errors = package_validator.validate_metadata(metadata)
if valid then
  print("✓ Metadata is valid")
else
  print("✗ Metadata validation failed:")
  for _, err in ipairs(errors) do
    print("  • " .. err)
  end
end
print()

-- Example 3: Validate components
print("3. Validating components...")
local components = {
  {
    id = "audit_stats_cards",
    type = "audit_stats_cards",
    name = "Audit Stats Cards",
    description = "Grid of stat cards showing audit log summary",
    props = {
      stats = {
        total = 0,
        successful = 0,
        failed = 0,
        rateLimit = 0
      }
    },
    layout = {
      type = "Grid",
      props = { cols = 4, gap = 4 }
    }
  }
}

local valid, errors = package_validator.validate_components(components)
if valid then
  print("✓ Components are valid")
else
  print("✗ Component validation failed:")
  for _, err in ipairs(errors) do
    print("  • " .. err)
  end
end
print()

-- Example 4: Demonstrate validation failure
print("4. Demonstrating validation failure...")
local invalid_metadata = {
  packageId = "Invalid-Package",  -- Invalid: contains uppercase and hyphen
  name = "Test",
  version = "1.0",  -- Invalid: not semantic versioning
  description = "Test package",
  author = "Test",
  category = "test",
  minLevel = 10  -- Invalid: out of range
}

local valid, errors = package_validator.validate_metadata(invalid_metadata)
print("✗ Expected validation failures:")
for _, err in ipairs(errors) do
  print("  • " .. err)
end
