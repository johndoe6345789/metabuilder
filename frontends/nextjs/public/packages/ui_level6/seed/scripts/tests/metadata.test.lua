-- Metadata validation tests for ui_level6 package
local metadata = load_cases("metadata.json")

describe("UI Level 6 Package Metadata", function()
  it("should have valid package structure", function()
    expect(metadata.packageId).toBe("ui_level6")
    expect(metadata.name).toBe("Level 6 - Supergod Panel")
    expect(metadata.version).toBeTruthy()
    expect(metadata.description).toBeTruthy()
  end)

  it("should have correct minLevel", function()
    expect(metadata.minLevel).toBe(6)
  end)

  it("should have required dependencies", function()
    local expected_deps = { "ui_permissions", "ui_header", "ui_intro" }

    for _, dep in ipairs(expected_deps) do
      local found = false
      for _, dependency in ipairs(metadata.dependencies) do
        if dependency == dep then
          found = true
          break
        end
      end
      expect(found).toBe(true)
    end
  end)

  it("should export level6 page", function()
    expect(metadata.exports.pages).toBeTruthy()

    local found = false
    for _, page in ipairs(metadata.exports.pages) do
      if page == "level6" then
        found = true
        break
      end
    end
    expect(found).toBe(true)
  end)

  it("should export required scripts", function()
    local expected_scripts = { "layout", "tenants", "transfer", "system" }

    for _, script in ipairs(expected_scripts) do
      local found = false
      for _, exported in ipairs(metadata.exports.scripts) do
        if exported == script then
          found = true
          break
        end
      end
      expect(found).toBe(true)
    end
  end)

  it("should be in ui category", function()
    expect(metadata.category).toBe("ui")
  end)
end)
