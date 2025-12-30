-- lua_test package initialization
-- Unit testing framework for MetaBuilder Lua scripts

local M = {}

M.version = "1.0.0"
M.name = "lua_test"

function M.init()
  return {
    success = true,
    message = "Lua Test Framework initialized",
    version = M.version
  }
end

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
