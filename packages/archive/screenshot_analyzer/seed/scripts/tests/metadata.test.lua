-- Metadata validation tests for screenshot_analyzer package
-- Uses lua_test framework

describe("Screenshot Analyzer Package Metadata", function()
  local metadata = load_cases("metadata.json")
  
  it("should have valid package structure", function()
    expect(metadata.name).toBe("screenshot_analyzer")
    expect(metadata.version).toBeTruthy()
    expect(metadata.description).toBeTruthy()
  end)
  
  it("should have semantic version", function()
    expect(metadata.version).toMatch("^%d+%.%d+%.%d+$")
  end)
  
  it("should have exports defined", function()
    expect(metadata.exports).toBeTruthy()
    expect(metadata.exports.components).toBeType("table")
  end)
  
  it("should have dependencies array", function()
    expect(metadata.dependencies).toBeType("table")
  end)
  
  it("should require minLevel 5", function()
    expect(metadata.minLevel).toBe(5)
  end)
end)
