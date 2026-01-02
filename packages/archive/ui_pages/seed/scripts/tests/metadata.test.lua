-- Metadata validation tests for ui_pages package
-- Uses lua_test framework

describe("UI Pages Bundle Package Metadata", function()
  local metadata = load_cases("metadata.json")
  
  it("should have valid package structure", function()
    expect(metadata.packageId).toBe("ui_pages")
    expect(metadata.name).toBe("UI Pages Bundle")
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
  
  it("should depend on ui_permissions", function()
    local found = false
    for _, dep in ipairs(metadata.dependencies) do
      if dep == "ui_permissions" then found = true break end
    end
    expect(found).toBe(true)
  end)
  
  it("should bundle all level packages", function()
    local levelPkgs = { "ui_login", "ui_home", "ui_level2", "ui_level3", "ui_level4", "ui_level5", "ui_level6" }
    for _, pkg in ipairs(levelPkgs) do
      local found = false
      for _, dep in ipairs(metadata.dependencies) do
        if dep == pkg then found = true break end
      end
      expect(found).toBe(true)
    end
  end)
end)
