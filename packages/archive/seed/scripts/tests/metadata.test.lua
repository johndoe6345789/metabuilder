-- Metadata validation tests for audit_log package
local metadata = load_cases("metadata.json")

describe("Audit Log Package Metadata", function()
  it("should have valid package structure", function()
    expect(metadata.packageId).toBe("audit_log")
    expect(metadata.name).toBe("Audit Log")
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
    expect(metadata.exports.scripts).toBeType("table")
  end)

  it("should export required components", function()
    local expected_components = {
      "AuditLogViewer",
      "AuditStatsCard",
      "LogTable",
      "LogFilters"
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
    local expected_scripts = {
      "init",
      "stats",
      "filters",
      "formatting"
    }

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

  it("should have correct bindings", function()
    expect(metadata.bindings).toBeTruthy()
    expect(metadata.bindings.dbal).toBe(true)
    expect(metadata.bindings.browser).toBe(false)
  end)

  it("should be admin category", function()
    expect(metadata.category).toBe("admin")
  end)

  it("should have devDependencies", function()
    expect(metadata.devDependencies).toBeType("table")
    expect(#metadata.devDependencies).toBeGreaterThan(0)
  end)
end)
