-- Metadata validation tests for irc_webchat package
-- Uses lua_test framework

describe("IRC Webchat Package Metadata", function()
  local metadata = load_cases("metadata.json")
  
  it("should have valid package structure", function()
    expect(metadata.packageId).toBe("irc_webchat")
    expect(metadata.name).toBe("IRC Webchat")
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
  
  it("should export IRCWebchat component", function()
    local components = metadata.exports.components
    local found = false
    for _, c in ipairs(components) do
      if c == "IRCWebchat" then found = true break end
    end
    expect(found).toBe(true)
  end)
end)
