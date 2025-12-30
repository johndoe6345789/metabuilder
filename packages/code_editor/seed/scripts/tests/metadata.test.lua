-- Metadata validation tests for code_editor package
local metadata = load_cases("metadata.json")

describe("Code Editor Package Metadata", function()
  it("should have valid package structure", function()
    expect(metadata.packageId).toBe("code_editor")
    expect(metadata.name).toBe("Code Editor")
    expect(metadata.version).toBeTruthy()
    expect(metadata.description).toBeTruthy()
  end)

  it("should be in editors category", function()
    expect(metadata.category).toBe("editors")
  end)

  it("should export required scripts", function()
    local expected_scripts = { "json", "lua", "theme" }

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

  it("should export required components", function()
    local expected_components = {
      "CodeEditor",
      "JsonEditor",
      "LuaEditor",
      "ThemeEditor"
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

  it("should have correct minLevel", function()
    expect(metadata.minLevel).toBe(5)
  end)
end)
