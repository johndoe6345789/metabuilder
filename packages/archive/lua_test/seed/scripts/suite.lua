-- Test suite state and management
-- Handles suite creation, registration, and configuration

---@class SuiteManager
---@field _suites TestSuite[] Array of registered test suites
---@field _currentSuite TestSuite|nil Currently active suite during registration
---@field _config TestConfig Framework configuration
local M = {}

-- Test suite state
M._suites = {}
M._currentSuite = nil
M._config = {
  timeout = 5000,
  verbose = true,
  stopOnFirstFailure = false,
  filter = nil
}

---Create a new test suite
---@param name string Name of the test suite
---@return TestSuite
function M.createSuite(name)
  local suite = {
    name = name,
    tests = {},
    beforeAll = nil,
    afterAll = nil,
    beforeEach = nil,
    afterEach = nil,
    nested = {},
    parent = nil
  }
  return suite
end

---Register a suite with the framework
---@param suite TestSuite The suite to register
function M.registerSuite(suite)
  M._suites[#M._suites + 1] = suite
end

---Get the current suite being defined
---@return TestSuite|nil
function M.getCurrentSuite()
  return M._currentSuite
end

---Set the current suite being defined
---@param suite TestSuite|nil
function M.setCurrentSuite(suite)
  M._currentSuite = suite
end

---Configure the test framework
---@param options TestConfig Configuration options to set
function M.configure(options)
  for k, v in pairs(options) do
    if M._config[k] ~= nil then
      M._config[k] = v
    end
  end
end

---Get all registered test suites
---@return TestSuite[] Array of registered suites
function M.getSuites()
  return M._suites
end

---Reset all suites and state for a fresh test run
function M.reset()
  M._suites = {}
  M._currentSuite = nil
end

---Get current test configuration
---@return TestConfig Current configuration
function M.getConfig()
  return M._config
end

return M
