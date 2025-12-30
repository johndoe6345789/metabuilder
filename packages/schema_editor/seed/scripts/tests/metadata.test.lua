-- Metadata validation tests for schema_editor package
-- Uses lua_test framework

describe("Schema Editor Package Metadata", function()
  local metadata = load_cases("metadata.json")
  
  it("should have valid package structure", function()
    expect(metadata.packageId).toBe("schema_editor")
    expect(metadata.name).toBe("Schema Editor")
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
  end)
  
  it("should have dependencies array", function()
    expect(metadata.dependencies).toBeType("table")
  end)
  
  it("should require minLevel 5", function()
    expect(metadata.minLevel).toBe(5)
  end)
  
  it("should depend on form_builder", function()
    local found = false
    for _, dep in ipairs(metadata.dependencies) do
      if dep == "form_builder" then found = true break end
    end
    expect(found).toBe(true)
  end)
end)
