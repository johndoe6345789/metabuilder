-- lua_test package initialization
-- Unit testing framework for MetaBuilder Lua scripts

---@class LuaTestModule
---@field version string Package version
---@field name string Package name
local M = {}

M.version = "1.0.0"
M.name = "lua_test"

---@class LuaTestInitResult
---@field success boolean Whether initialization succeeded
---@field message string Initialization message
---@field version string Package version

---Initialize the Lua test framework
---@return LuaTestInitResult
function M.init()
  return {
    success = true,
    message = "Lua Test Framework initialized",
    version = M.version
  }
end

---@class LuaTestInfo
---@field name string Package name
---@field version string Package version
---@field description string Package description
---@field features string[] List of framework features

---Get information about the test framework
---@return LuaTestInfo
function M.info()
  return {
    name = M.name,
    version = M.version,
    description = "Unit testing framework for Lua scripts",
    features = {
      "describe/it blocks",
      "assertions (expect)",
      "beforeEach/afterEach hooks",
      "mocks and spies",
      "async test support",
      "test filtering",
      "detailed reporting"
    }
  }
end

return M
