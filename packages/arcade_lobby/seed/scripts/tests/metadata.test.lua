-- Metadata validation tests for arcade_lobby package
-- Uses lua_test framework

describe("Arcade Lobby Package Metadata", function()
  local metadata = load_cases("metadata.json")
  
  it("should have valid package structure", function()
    expect(metadata.packageId).toBe("arcade_lobby")
    expect(metadata.name).toBe("Arcade Lobby")
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
end)
