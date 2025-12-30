-- Core test framework with describe/it blocks
-- Provides BDD-style test organization

local M = {}

-- JSON parser for loading test cases
local json = {}

function json.decode(str)
  -- Simple JSON parser for test case loading
  -- Handles objects, arrays, strings, numbers, booleans, null
  local pos = 1
  
  local function skip_whitespace()
    while pos <= #str and str:sub(pos, pos):match("%s") do
      pos = pos + 1
    end
  end
  
  local function parse_string()
    pos = pos + 1 -- skip opening quote
    local start = pos
    while pos <= #str do
      local c = str:sub(pos, pos)
      if c == '"' then
        local result = str:sub(start, pos - 1)
        pos = pos + 1
        -- Handle escape sequences
        result = result:gsub("\\n", "\n"):gsub("\\t", "\t"):gsub("\\r", "\r")
        result = result:gsub('\\"', '"'):gsub("\\\\", "\\")
        return result
      elseif c == "\\" then
        pos = pos + 2 -- skip escape sequence
      else
        pos = pos + 1
      end
    end
    error("Unterminated string")
  end
  
  local function parse_number()
    local start = pos
    while pos <= #str and str:sub(pos, pos):match("[%d%.eE%+%-]") do
      pos = pos + 1
    end
    return tonumber(str:sub(start, pos - 1))
  end
  
  local parse_value -- forward declaration
  
  local function parse_array()
    pos = pos + 1 -- skip [
    local arr = {}
    skip_whitespace()
    if str:sub(pos, pos) == "]" then
      pos = pos + 1
      return arr
    end
    while true do
      skip_whitespace()
      arr[#arr + 1] = parse_value()
      skip_whitespace()
      local c = str:sub(pos, pos)
      if c == "]" then
        pos = pos + 1
        return arr
      elseif c == "," then
        pos = pos + 1
      else
        error("Expected ',' or ']' in array at position " .. pos)
      end
    end
  end
  
  local function parse_object()
    pos = pos + 1 -- skip {
    local obj = {}
    skip_whitespace()
    if str:sub(pos, pos) == "}" then
      pos = pos + 1
      return obj
    end
    while true do
      skip_whitespace()
      if str:sub(pos, pos) ~= '"' then
        error("Expected string key at position " .. pos)
      end
      local key = parse_string()
      skip_whitespace()
      if str:sub(pos, pos) ~= ":" then
        error("Expected ':' at position " .. pos)
      end
      pos = pos + 1
      skip_whitespace()
      obj[key] = parse_value()
      skip_whitespace()
      local c = str:sub(pos, pos)
      if c == "}" then
        pos = pos + 1
        return obj
      elseif c == "," then
        pos = pos + 1
      else
        error("Expected ',' or '}' in object at position " .. pos)
      end
    end
  end
  
  parse_value = function()
    skip_whitespace()
    local c = str:sub(pos, pos)
    if c == '"' then
      return parse_string()
    elseif c == "{" then
      return parse_object()
    elseif c == "[" then
      return parse_array()
    elseif c == "t" and str:sub(pos, pos + 3) == "true" then
      pos = pos + 4
      return true
    elseif c == "f" and str:sub(pos, pos + 4) == "false" then
      pos = pos + 5
      return false
    elseif c == "n" and str:sub(pos, pos + 3) == "null" then
      pos = pos + 4
      return nil
    elseif c:match("[%d%-]") then
      return parse_number()
    else
      error("Unexpected character '" .. c .. "' at position " .. pos)
    end
  end
  
  return parse_value()
end

-- Load test cases from JSON content
-- jsonContent: raw JSON string
-- path: optional dot-path to nested data (e.g., "login.valid")
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
