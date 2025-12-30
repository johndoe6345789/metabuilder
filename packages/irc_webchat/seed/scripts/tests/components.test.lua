-- Component validation tests for irc_webchat package
-- Uses lua_test framework

describe("IRC Webchat Components", function()
  local components = load_cases("components.json")
  
  it("should be a valid array", function()
    expect(components).toBeType("table")
  end)
  
  it("should have valid component structure if components exist", function()
    if #components > 0 then
      for _, component in ipairs(components) do
        expect(component.id).toBeTruthy()
        expect(component.type).toBeTruthy()
        expect(component.id).toBeType("string")
        expect(component.type).toBeType("string")
      end
    end
  end)
end)
