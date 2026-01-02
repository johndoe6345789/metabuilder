-- Core test framework - main entry point
-- Re-exports all modules for convenient access
--
-- Split into focused modules:
--   json.lua     - JSON parser for test case loading
--   types.lua    - Shared type definitions
--   suite.lua    - Suite creation and state management
--   describe.lua - BDD describe/it/xit/fit functions
--   hooks.lua    - beforeAll/afterAll/beforeEach/afterEach

local json = require("json")
local suite = require("suite")
local describe = require("describe")
local hooks = require("hooks")

---@class TestFramework
---@field _suites TestSuite[] Array of registered test suites
---@field _currentSuite TestSuite|nil Currently active suite during registration
---@field _config TestConfig Framework configuration
local M = {}

-- Re-export JSON parser
M.json = json

---Load test cases from JSON content
---@param jsonContent string Raw JSON string containing test cases
---@param path? string Optional dot-path to nested data (e.g., "login.valid")
---@return table[] Array of test case objects
function M.load_cases(jsonContent, path)
  local data = json.decode(jsonContent)
  
  if path then
    for segment in string.gmatch(path, "[^%.]+") do
      if data and type(data) == "table" then
        data = data[segment]
      else
        error("Invalid path: " .. path)
      end
    end
  end
  
  return data or {}
end

-- Re-export suite management (with state access)
M._suites = suite._suites
M._currentSuite = suite._currentSuite
M._config = suite._config

M.createSuite = suite.createSuite
M.configure = suite.configure
M.getSuites = suite.getSuites
M.reset = suite.reset
M.getConfig = suite.getConfig

-- Re-export BDD functions
M.describe = describe.describe
M.it = describe.it
M.it_each = describe.it_each
M.xit = describe.xit
M.fit = describe.fit
M.fit_each = describe.fit_each
M.xit_each = describe.xit_each

-- Re-export hooks
M.beforeAll = hooks.beforeAll
M.afterAll = hooks.afterAll
M.beforeEach = hooks.beforeEach
M.afterEach = hooks.afterEach

return M
