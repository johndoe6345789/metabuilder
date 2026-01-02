-- Metadata validation tests for ui_level5 package
-- Uses lua_test framework

describe("Level 5 God Panel Package Metadata", function()
  local metadata = load_cases("metadata.json")
  
  it("should have valid package structure", function()
    expect(metadata.packageId).toBe("ui_level5")
    expect(metadata.name).toBe("Level 5 - God Panel")
    expect(metadata.version).toBeTruthy()
    expect(metadata.description).toBeTruthy()
  end)
  
  it("should have correct package ID format", function()
    expect(metadata.packageId).toMatch("^[a-z_0-9]+$")
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
  
  it("should depend on ui_permissions", function()
    local found = false
    for _, dep in ipairs(metadata.dependencies) do
      if dep == "ui_permissions" then found = true break end
    end
    expect(found).toBe(true)
  end)
  
  it("should require minLevel 5", function()
    expect(metadata.minLevel).toBe(5)
  end)
  
  it("should export pages", function()
    expect(metadata.exports.pages).toBeType("table")
  end)
end)
