-- Component validation tests for audit_log package
local components = load_cases("components.json")

describe("Audit Log Components", function()
  it("should be a valid array", function()
    expect(components).toBeType("table")
    expect(#components).toBeGreaterThan(0)
  end)

  it("should have valid component structure", function()
    for _, component in ipairs(components) do
      expect(component.id).toBeTruthy()
      expect(component.type).toBeTruthy()
      expect(component.id).toBeType("string")
      expect(component.type).toBeType("string")
    end
  end)

  it("should have audit_stats_cards component", function()
    local found = false
    for _, component in ipairs(components) do
      if component.id == "audit_stats_cards" then
        found = true
        expect(component.name).toBe("Audit Stats Cards")
        expect(component.props).toBeTruthy()
        expect(component.props.stats).toBeTruthy()
        expect(component.layout).toBeTruthy()
        expect(component.layout.type).toBe("Grid")
      end
    end
    expect(found).toBe(true)
  end)

  it("should have audit_log_viewer component", function()
    local found = false
    for _, component in ipairs(components) do
      if component.id == "audit_log_viewer" then
        found = true
        expect(component.name).toBe("Audit Log Viewer")
        expect(component.props).toBeTruthy()
        expect(component.bindings).toBeTruthy()
        expect(component.bindings.dbal).toBe(true)
      end
    end
    expect(found).toBe(true)
  end)

  it("should have required scripts in components", function()
    for _, component in ipairs(components) do
      if component.scripts then
        expect(component.scripts).toBeType("table")
      end
    end
  end)

  it("should have valid layout structures", function()
    for _, component in ipairs(components) do
      if component.layout then
        expect(component.layout.type).toBeTruthy()
        expect(component.layout.type).toBeType("string")
      end
    end
  end)
end)
