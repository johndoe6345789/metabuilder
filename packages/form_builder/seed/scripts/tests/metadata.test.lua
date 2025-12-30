-- Metadata validation tests for form_builder package
-- Uses lua_test framework

describe("Form Builder Package Metadata", function()
  local metadata = load_cases("metadata.json")
  
  it("should have valid package structure", function()
    expect(metadata.packageId).toBe("form_builder")
    expect(metadata.name).toBe("Form Builder")
    expect(metadata.version).toBeTruthy()
    expect(metadata.description).toBeTruthy()
  end)
  
  it("should have correct package ID format", function()
    expect(metadata.packageId).toMatch("^[a-z_]+$")
  end)
  
  it("should have semantic version", function()
    expect(metadata.version).toMatch("^%d+%.%d+%.%d+$")
  end)
  
  it("should have exports defined", function()
    expect(metadata.exports).toBeTruthy()
    expect(metadata.exports.components).toBeType("table")
  end)
  
  it("should export form field components", function()
    local components = metadata.exports.components
    expect(#components).toBeGreaterThan(0)
  end)
  
  it("should export validation scripts", function()
    local scripts = metadata.exports.scripts
    expect(scripts).toBeTruthy()
    local hasValidate = false
    for _, s in ipairs(scripts) do
      if s == "validate" then hasValidate = true break end
    end
    expect(hasValidate).toBe(true)
  end)
end)
