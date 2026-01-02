-- BDD-style test definition functions
-- Provides describe, it, xit, fit and parameterized variants

local suite = require("suite")

---@class DescribeModule
local M = {}

---Describe block - groups related tests
---@param name string Name of the test group
---@param fn function Function containing test definitions
---@return TestSuite The created test suite
function M.describe(name, fn)
  local parentSuite = suite.getCurrentSuite()
  local newSuite = suite.createSuite(name)
  newSuite.parent = parentSuite
  
  if parentSuite then
    parentSuite.nested[#parentSuite.nested + 1] = newSuite
  else
    suite.registerSuite(newSuite)
  end
  
  suite.setCurrentSuite(newSuite)
  fn()
  suite.setCurrentSuite(parentSuite)
  
  return newSuite
end

---It block - defines a single test
---@param name string Name of the test
---@param fn function Test function to execute
---@return Test The created test
function M.it(name, fn)
  local currentSuite = suite.getCurrentSuite()
  if not currentSuite then
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
  
  currentSuite.tests[#currentSuite.tests + 1] = test
  return test
end

---Parameterized tests - it.each(cases)(name, fn)
---@param cases table[] Array of test case objects
---@return ParameterizedTestFactory Factory function accepting name template and test function
function M.it_each(cases)
  return function(nameTemplate, fn)
    for _, testCase in ipairs(cases) do
      -- Interpolate $fieldName in the name template
      local name = nameTemplate
      for key, value in pairs(testCase) do
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

---Skip a test - test will be marked as skipped and not executed
---@param name string Name of the skipped test
---@param fn function Test function (will not be executed)
---@return Test The created skipped test
function M.xit(name, fn)
  local currentSuite = suite.getCurrentSuite()
  if not currentSuite then
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
  
  currentSuite.tests[#currentSuite.tests + 1] = test
  return test
end

---Only run this test (for debugging) - all other tests in suite will be skipped
---@param name string Name of the focused test
---@param fn function Test function to execute
---@return Test The created focused test
function M.fit(name, fn)
  local test = M.it(name, fn)
  test.only = true
  return test
end

---Parameterized focused tests - fit.each(cases)(name, fn)
---@param cases table[] Array of test case objects
---@return ParameterizedTestFactory Factory function for focused parameterized tests
function M.fit_each(cases)
  return function(nameTemplate, fn)
    for _, testCase in ipairs(cases) do
      local name = nameTemplate
      for key, value in pairs(testCase) do
        local strValue = type(value) == "table" and "[table]" or tostring(value)
        name = string.gsub(name, "%$" .. key, strValue)
      end
      M.fit(name, function()
        fn(testCase)
      end)
    end
  end
end

---Parameterized skipped tests - xit.each(cases)(name, fn)
---@param cases table[] Array of test case objects
---@return ParameterizedTestFactory Factory function for skipped parameterized tests
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

return M
