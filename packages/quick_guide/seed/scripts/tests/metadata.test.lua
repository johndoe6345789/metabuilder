-- Metadata validation tests for quick_guide package
local metadata = load_cases("metadata.json")

describe("Quick Guide Package Metadata", function()
  it("should have valid package structure", function()
    expect(metadata.packageId).toBe("quick_guide")
    expect(metadata.name).toBe("Quick Guide")
    expect(metadata.version).toBeTruthy()
    expect(metadata.description).toBeTruthy()
  end)

  it("should export required components", function()
    local expected_components = {
      "StepsEditor",
      "MediaPane",
      "QuickGuideBuilder"
    }

    for _, comp in ipairs(expected_components) do
      local found = false
      for _, exported in ipairs(metadata.exports.components) do
        if exported == comp then
          found = true
          break
        end
      end
      expect(found).toBe(true)
    end
  end)

  it("should export required scripts", function()
    local expected_scripts = { "init", "steps", "media" }

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

  it("should have correct minLevel", function()
    expect(metadata.minLevel).toBe(2)
  end)
end)
