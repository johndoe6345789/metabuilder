-- Core test framework with describe/it blocks
-- Provides BDD-style test organization

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

-- Create a new test suite
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

-- Describe block - groups related tests
function M.describe(name, fn)
  local parentSuite = M._currentSuite
  local suite = M.createSuite(name)
  suite.parent = parentSuite
  
  if parentSuite then
    parentSuite.nested[#parentSuite.nested + 1] = suite
  else
    M._suites[#M._suites + 1] = suite
  end
  
  M._currentSuite = suite
  fn()
  M._currentSuite = parentSuite
  
  return suite
end

-- It block - defines a single test
function M.it(name, fn)
  if not M._currentSuite then
    error("it() must be called inside a describe() block")
  end
  
  local test = {
    name = name,
    fn = fn,
    status = "pending",
    error = nil,
    duration = 0,
    skipped = false
  }
  
  M._currentSuite.tests[#M._currentSuite.tests + 1] = test
  return test
end

-- Parameterized tests - it.each(cases)(name, fn)
-- cases: array of test case objects
-- name: string with $fieldName placeholders for interpolation
-- fn: function(testCase) that receives each case
function M.it_each(cases)
  return function(nameTemplate, fn)
    for _, testCase in ipairs(cases) do
      -- Interpolate $fieldName in the name template
      local name = nameTemplate
      for key, value in pairs(testCase) do
        local placeholder = "$" .. key
        local strValue = type(value) == "table" and "[table]" or tostring(value)
        name = string.gsub(name, "%$" .. key, strValue)
      end
      
      -- Create test with the interpolated name
      M.it(name, function()
        fn(testCase)
      end)
    end
  end
end

-- Skip a test
function M.xit(name, fn)
  if not M._currentSuite then
    error("xit() must be called inside a describe() block")
  end
  
  local test = {
    name = name,
    fn = fn,
    status = "skipped",
    error = nil,
    duration = 0,
    skipped = true
  }
  
  M._currentSuite.tests[#M._currentSuite.tests + 1] = test
  return test
end

-- Only run this test (for debugging)
function M.fit(name, fn)
  local test = M.it(name, fn)
  test.only = true
  return test
end

-- Parameterized fit - fit.each(cases)(name, fn)
function M.fit_each(cases)
  return function(nameTemplate, fn)
    for _, testCase in ipairs(cases) do
      local name = nameTemplate
      for key, value in pairs(testCase) do
        local placeholder = "$" .. key
        local strValue = type(value) == "table" and "[table]" or tostring(value)
        name = string.gsub(name, "%$" .. key, strValue)
      end
      M.fit(name, function()
        fn(testCase)
      end)
    end
  end
end

-- Parameterized xit - xit.each(cases)(name, fn)
function M.xit_each(cases)
  return function(nameTemplate, fn)
    for _, testCase in ipairs(cases) do
      local name = nameTemplate
      for key, value in pairs(testCase) do
        local strValue = type(value) == "table" and "[table]" or tostring(value)
        name = string.gsub(name, "%$" .. key, strValue)
      end
      M.xit(name, function()
        fn(testCase)
      end)
    end
  end
end

-- Setup hooks
function M.beforeAll(fn)
  if M._currentSuite then
    M._currentSuite.beforeAll = fn
  end
end

function M.afterAll(fn)
  if M._currentSuite then
    M._currentSuite.afterAll = fn
  end
end

function M.beforeEach(fn)
  if M._currentSuite then
    M._currentSuite.beforeEach = fn
  end
end

function M.afterEach(fn)
  if M._currentSuite then
    M._currentSuite.afterEach = fn
  end
end

-- Configure the test framework
function M.configure(options)
  for k, v in pairs(options) do
    if M._config[k] ~= nil then
      M._config[k] = v
    end
  end
end

-- Get all registered suites
function M.getSuites()
  return M._suites
end

-- Reset all suites (for fresh test runs)
function M.reset()
  M._suites = {}
  M._currentSuite = nil
end

-- Get current config
function M.getConfig()
  return M._config
end

return M
