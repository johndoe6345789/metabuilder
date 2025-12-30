/**
 * Lua Test Runner Integration
 * TypeScript utilities for running Lua tests from packages
 */

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export interface LuaTestResult {
  name: string
  status: 'passed' | 'failed' | 'skipped' | 'pending'
  error?: string
  expected?: JsonValue
  actual?: JsonValue
  duration: number
}

export interface LuaSuiteResult {
  name: string
  tests: LuaTestResult[]
  nested: LuaSuiteResult[]
  stats: {
    total: number
    passed: number
    failed: number
    skipped: number
    duration: number
  }
}

export interface LuaTestRunResult {
  suites: LuaSuiteResult[]
  stats: {
    total: number
    passed: number
    failed: number
    skipped: number
    duration: number
    suiteCount: number
    success: boolean
  }
  timestamp: string
}

export interface LuaTestConfig {
  timeout?: number
  verbose?: boolean
  stopOnFirstFailure?: boolean
  filter?: string
}

export interface TestCaseFiles {
  [filename: string]: string  // filename -> JSON content
}

/**
 * Generates Lua code that runs tests and returns results
 * This code uses the lua_test framework modules
 */
export function generateTestRunnerCode(
  testCode: string,
  config: LuaTestConfig = {},
  testCaseFiles: TestCaseFiles = {}
): string {
  const configJson = JSON.stringify(config)
  const testCaseFilesJson = JSON.stringify(testCaseFiles)

  return `
-- Load lua_test framework modules
local framework = (function()
  ${getFrameworkModule()}
end)()

local assertions = (function()
  ${getAssertionsModule()}
end)()

local mocks = (function()
  ${getMocksModule()}
end)()

local runner = (function()
  ${getRunnerModule()}
end)()

local helpers = (function()
  ${getHelpersModule()}
end)()

local json_parser = (function()
  ${getJsonParserModule()}
end)()

-- Test case files loaded from package
local _test_case_files = ${testCaseFilesJson}

-- Load test cases from a JSON file
function load_cases(filename, path)
  local content = _test_case_files[filename]
  if not content then
    error("Test case file not found: " .. filename)
  end
  local data = json_parser.decode(content)
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

-- Configure framework
local config = ${configJson}
if config.timeout then framework.configure({ timeout = config.timeout }) end
if config.stopOnFirstFailure then framework.configure({ stopOnFirstFailure = config.stopOnFirstFailure }) end
if config.filter then framework.configure({ filter = config.filter }) end

-- Expose test DSL globally for the test code
describe = framework.describe
it = framework.it
xit = framework.xit
fit = framework.fit
beforeAll = framework.beforeAll
afterAll = framework.afterAll
beforeEach = framework.beforeEach
afterEach = framework.afterEach
it_each = framework.it_each
fit_each = framework.fit_each
xit_each = framework.xit_each
expect = assertions.expect
assertTrue = assertions.assertTrue
assertFalse = assertions.assertFalse
assertEqual = assertions.assertEqual
assertNotEqual = assertions.assertNotEqual
assertNil = assertions.assertNil
assertNotNil = assertions.assertNotNil
fail = assertions.fail
mock = mocks

-- Reset any previous test state
framework.reset()

-- Execute the test definitions
${testCode}

-- Run all registered tests
local results = runner.runAll(framework.getSuites(), config)

-- Return results
return results
`
}

/**
 * Inlined framework module code (simplified for embedding)
 */
function getFrameworkModule(): string {
  return `
local M = {}
M._suites = {}
M._currentSuite = nil
M._config = { timeout = 5000, verbose = true, stopOnFirstFailure = false, filter = nil }

function M.createSuite(name)
  return { name = name, tests = {}, beforeAll = nil, afterAll = nil, beforeEach = nil, afterEach = nil, nested = {}, parent = nil }
end

function M.describe(name, fn)
  local parentSuite = M._currentSuite
  local suite = M.createSuite(name)
  suite.parent = parentSuite
  if parentSuite then parentSuite.nested[#parentSuite.nested + 1] = suite
  else M._suites[#M._suites + 1] = suite end
  M._currentSuite = suite
  fn()
  M._currentSuite = parentSuite
  return suite
end

function M.it(name, fn)
  if not M._currentSuite then error("it() must be called inside describe()") end
  local test = { name = name, fn = fn, status = "pending", error = nil, duration = 0, skipped = false }
  M._currentSuite.tests[#M._currentSuite.tests + 1] = test
  return test
end

function M.xit(name, fn)
  if not M._currentSuite then error("xit() must be called inside describe()") end
  local test = { name = name, fn = fn, status = "skipped", skipped = true }
  M._currentSuite.tests[#M._currentSuite.tests + 1] = test
  return test
end

function M.fit(name, fn)
  local test = M.it(name, fn)
  test.only = true
  return test
end

-- Parameterized test helper
local function create_each(testFn)
  return function(cases)
    return function(nameTemplate, fn)
      for _, testCase in ipairs(cases) do
        local name = nameTemplate
        for key, value in pairs(testCase) do
          local strValue = type(value) == "table" and "[table]" or tostring(value)
          name = string.gsub(name, "%$" .. key, strValue)
        end
        testFn(name, function() fn(testCase) end)
      end
    end
  end
end

function M.it_each(cases) return create_each(M.it)(cases) end
function M.fit_each(cases) return create_each(M.fit)(cases) end
function M.xit_each(cases) return create_each(M.xit)(cases) end

function M.beforeAll(fn) if M._currentSuite then M._currentSuite.beforeAll = fn end end
function M.afterAll(fn) if M._currentSuite then M._currentSuite.afterAll = fn end end
function M.beforeEach(fn) if M._currentSuite then M._currentSuite.beforeEach = fn end end
function M.afterEach(fn) if M._currentSuite then M._currentSuite.afterEach = fn end end

function M.configure(options)
  for k, v in pairs(options) do
    if M._config[k] ~= nil then M._config[k] = v end
  end
end

function M.getSuites() return M._suites end
function M.reset() M._suites = {} M._currentSuite = nil end
function M.getConfig() return M._config end

return M
`
}

function getAssertionsModule(): string {
  return `
local M = {}

local function stringify(value)
  local t = type(value)
  if t == "string" then return '"' .. value .. '"'
  elseif t == "table" then
    local parts = {}
    for k, v in pairs(value) do parts[#parts + 1] = tostring(k) .. "=" .. stringify(v) end
    return "{" .. table.concat(parts, ", ") .. "}"
  elseif t == "nil" then return "nil"
  else return tostring(value) end
end

local function deepEqual(a, b)
  if type(a) ~= type(b) then return false end
  if type(a) ~= "table" then return a == b end
  for k, v in pairs(a) do if not deepEqual(v, b[k]) then return false end end
  for k, _ in pairs(b) do if a[k] == nil then return false end end
  return true
end

local function assertionError(message, expected, actual)
  return { type = "AssertionError", message = message, expected = expected, actual = actual }
end

function M.expect(actual)
  local expectation = { actual = actual, negated = false }
  expectation.never = setmetatable({}, { __index = function(_, key) expectation.negated = true return expectation[key] end })
  
  function expectation.toBe(expected)
    local pass = actual == expected
    if expectation.negated then pass = not pass end
    if not pass then
      local msg = expectation.negated and "Expected " .. stringify(actual) .. " not to be " .. stringify(expected) or "Expected " .. stringify(actual) .. " to be " .. stringify(expected)
      error(assertionError(msg, expected, actual))
    end
    return true
  end
  
  function expectation.toEqual(expected)
    local pass = deepEqual(actual, expected)
    if expectation.negated then pass = not pass end
    if not pass then error(assertionError(expectation.negated and "Expected values not to be deeply equal" or "Expected values to be deeply equal", expected, actual)) end
    return true
  end
  
  function expectation.toBeNil()
    local pass = actual == nil
    if expectation.negated then pass = not pass end
    if not pass then error(assertionError(expectation.negated and "Expected not nil" or "Expected nil", nil, actual)) end
    return true
  end
  
  function expectation.toBeTruthy()
    local pass = actual and true or false
    if expectation.negated then pass = not pass end
    if not pass then error(assertionError(expectation.negated and "Expected falsy" or "Expected truthy", "truthy", actual)) end
    return true
  end
  
  function expectation.toBeFalsy()
    local pass = not actual
    if expectation.negated then pass = not pass end
    if not pass then error(assertionError(expectation.negated and "Expected truthy" or "Expected falsy", "falsy", actual)) end
    return true
  end
  
  function expectation.toBeType(expectedType)
    local actualType = type(actual)
    local pass = actualType == expectedType
    if expectation.negated then pass = not pass end
    if not pass then error(assertionError("Type mismatch", expectedType, actualType)) end
    return true
  end
  
  function expectation.toContain(expected)
    local pass = false
    if type(actual) == "string" and type(expected) == "string" then pass = string.find(actual, expected, 1, true) ~= nil
    elseif type(actual) == "table" then
      for _, v in pairs(actual) do if deepEqual(v, expected) then pass = true break end end
    end
    if expectation.negated then pass = not pass end
    if not pass then error(assertionError("toContain failed", expected, actual)) end
    return true
  end
  
  function expectation.toHaveLength(expectedLength)
    local actualLength = type(actual) == "string" and #actual or (type(actual) == "table" and #actual or 0)
    local pass = actualLength == expectedLength
    if expectation.negated then pass = not pass end
    if not pass then error(assertionError("Length mismatch", expectedLength, actualLength)) end
    return true
  end
  
  function expectation.toBeGreaterThan(expected)
    local pass = actual > expected
    if expectation.negated then pass = not pass end
    if not pass then error(assertionError("toBeGreaterThan failed", "> " .. expected, actual)) end
    return true
  end
  
  function expectation.toBeLessThan(expected)
    local pass = actual < expected
    if expectation.negated then pass = not pass end
    if not pass then error(assertionError("toBeLessThan failed", "< " .. expected, actual)) end
    return true
  end
  
  function expectation.toBeCloseTo(expected, precision)
    precision = precision or 2
    local diff = math.abs(actual - expected)
    local pass = diff < (10 ^ -precision) / 2
    if expectation.negated then pass = not pass end
    if not pass then error(assertionError("toBeCloseTo failed", expected, actual)) end
    return true
  end
  
  function expectation.toMatch(pattern)
    local pass = string.match(actual, pattern) ~= nil
    if expectation.negated then pass = not pass end
    if not pass then error(assertionError("Pattern match failed", pattern, actual)) end
    return true
  end
  
  function expectation.toThrow(expectedMessage)
    local success, err = pcall(actual)
    local pass = not success
    if pass and expectedMessage then
      local errMsg = type(err) == "table" and err.message or tostring(err)
      pass = string.find(errMsg, expectedMessage, 1, true) ~= nil
    end
    if expectation.negated then pass = not pass end
    if not pass then error(assertionError("toThrow failed", expectedMessage or "error", success and "no error" or err)) end
    return true
  end
  
  function expectation.toHaveProperty(key, value)
    local pass = actual[key] ~= nil
    if pass and value ~= nil then pass = deepEqual(actual[key], value) end
    if expectation.negated then pass = not pass end
    if not pass then error(assertionError("toHaveProperty failed", value, actual[key])) end
    return true
  end
  
  return expectation
end

function M.assertTrue(value, message) if not value then error(assertionError(message or "Expected true", true, value)) end end
function M.assertFalse(value, message) if value then error(assertionError(message or "Expected false", false, value)) end end
function M.assertEqual(actual, expected, message) if actual ~= expected then error(assertionError(message or "Values not equal", expected, actual)) end end
function M.assertNotEqual(actual, expected, message) if actual == expected then error(assertionError(message or "Values should not be equal", "not equal", actual)) end end
function M.assertNil(value, message) if value ~= nil then error(assertionError(message or "Expected nil", nil, value)) end end
function M.assertNotNil(value, message) if value == nil then error(assertionError(message or "Expected not nil", "not nil", nil)) end end
function M.fail(message) error(assertionError(message or "Test failed", nil, nil)) end

return M
`
}

function getMocksModule(): string {
  return `
local M = {}

function M.fn(implementation)
  local mock = { calls = {}, results = {}, implementation = implementation }
  
  local callable = function(...)
    local args = {...}
    mock.calls[#mock.calls + 1] = args
    local result = mock.implementation and {mock.implementation(...)} or {}
    mock.results[#mock.results + 1] = result
    return table.unpack(result)
  end
  
  return setmetatable({}, {
    __call = function(_, ...) return callable(...) end,
    __index = {
      getCallCount = function() return #mock.calls end,
      wasCalled = function() return #mock.calls > 0 end,
      wasCalledWith = function(...)
        local expectedArgs = {...}
        for _, callArgs in ipairs(mock.calls) do
          local match = true
          for i, expected in ipairs(expectedArgs) do if callArgs[i] ~= expected then match = false break end end
          if match then return true end
        end
        return false
      end,
      getCall = function(index) return mock.calls[index] end,
      getLastCall = function() return mock.calls[#mock.calls] end,
      getCalls = function() return mock.calls end,
      getResults = function() return mock.results end,
      reset = function() mock.calls = {} mock.results = {} end,
      mockReturnValue = function(value) mock.implementation = function() return value end end,
      mockImplementation = function(fn) mock.implementation = fn end,
      mockRestore = function() mock.implementation = nil mock.calls = {} mock.results = {} end
    }
  })
end

function M.spyOn(obj, methodName)
  local original = obj[methodName]
  local spy = M.fn(original)
  local meta = getmetatable(spy).__index
  local originalRestore = meta.mockRestore
  meta.mockRestore = function() obj[methodName] = original originalRestore() end
  obj[methodName] = function(...) return spy(...) end
  return spy
end

return M
`
}

function getRunnerModule(): string {
  return `
local M = {}

M.STATUS = { PASSED = "passed", FAILED = "failed", SKIPPED = "skipped", PENDING = "pending" }

function M.runTest(test, hooks)
  local result = { name = test.name, status = M.STATUS.PENDING, error = nil, duration = 0 }
  if test.skipped then result.status = M.STATUS.SKIPPED return result end
  
  local startTime = os.clock()
  if hooks.beforeEach then
    local success, err = pcall(hooks.beforeEach)
    if not success then
      result.status = M.STATUS.FAILED
      result.error = "beforeEach failed: " .. tostring(err)
      result.duration = (os.clock() - startTime) * 1000
      return result
    end
  end
  
  local success, err = pcall(test.fn)
  if hooks.afterEach then pcall(hooks.afterEach) end
  result.duration = (os.clock() - startTime) * 1000
  
  if success then result.status = M.STATUS.PASSED
  else
    result.status = M.STATUS.FAILED
    if type(err) == "table" and err.type == "AssertionError" then
      result.error = err.message
      result.expected = err.expected
      result.actual = err.actual
    else result.error = tostring(err) end
  end
  return result
end

function M.runSuite(suite, config, parentHooks)
  local results = { name = suite.name, tests = {}, nested = {}, stats = { total = 0, passed = 0, failed = 0, skipped = 0, duration = 0 } }
  config = config or {}
  parentHooks = parentHooks or {}
  local startTime = os.clock()
  local hooks = { beforeEach = suite.beforeEach or parentHooks.beforeEach, afterEach = suite.afterEach or parentHooks.afterEach }
  
  if suite.beforeAll then
    local success, err = pcall(suite.beforeAll)
    if not success then
      for _, test in ipairs(suite.tests) do
        results.tests[#results.tests + 1] = { name = test.name, status = M.STATUS.FAILED, error = "beforeAll failed: " .. tostring(err), duration = 0 }
        results.stats.failed = results.stats.failed + 1
        results.stats.total = results.stats.total + 1
      end
      results.stats.duration = (os.clock() - startTime) * 1000
      return results
    end
  end
  
  local hasOnly = false
  for _, test in ipairs(suite.tests) do if test.only then hasOnly = true break end end
  
  for _, test in ipairs(suite.tests) do
    if hasOnly and not test.only then
      results.tests[#results.tests + 1] = { name = test.name, status = M.STATUS.SKIPPED, duration = 0 }
      results.stats.skipped = results.stats.skipped + 1
    elseif config.filter and not string.find(test.name, config.filter, 1, true) then
      results.tests[#results.tests + 1] = { name = test.name, status = M.STATUS.SKIPPED, duration = 0 }
      results.stats.skipped = results.stats.skipped + 1
    else
      local testResult = M.runTest(test, hooks)
      results.tests[#results.tests + 1] = testResult
      if testResult.status == M.STATUS.PASSED then results.stats.passed = results.stats.passed + 1
      elseif testResult.status == M.STATUS.FAILED then
        results.stats.failed = results.stats.failed + 1
        if config.stopOnFirstFailure then break end
      elseif testResult.status == M.STATUS.SKIPPED then results.stats.skipped = results.stats.skipped + 1 end
    end
    results.stats.total = results.stats.total + 1
  end
  
  for _, nestedSuite in ipairs(suite.nested) do
    local nestedResults = M.runSuite(nestedSuite, config, hooks)
    results.nested[#results.nested + 1] = nestedResults
    results.stats.total = results.stats.total + nestedResults.stats.total
    results.stats.passed = results.stats.passed + nestedResults.stats.passed
    results.stats.failed = results.stats.failed + nestedResults.stats.failed
    results.stats.skipped = results.stats.skipped + nestedResults.stats.skipped
  end
  
  if suite.afterAll then pcall(suite.afterAll) end
  results.stats.duration = (os.clock() - startTime) * 1000
  return results
end

function M.runAll(suites, config)
  local allResults = { suites = {}, stats = { total = 0, passed = 0, failed = 0, skipped = 0, duration = 0, suiteCount = 0 }, timestamp = os.date("%Y-%m-%dT%H:%M:%S") }
  local startTime = os.clock()
  
  for _, suite in ipairs(suites) do
    local suiteResults = M.runSuite(suite, config)
    allResults.suites[#allResults.suites + 1] = suiteResults
    allResults.stats.suiteCount = allResults.stats.suiteCount + 1
    allResults.stats.total = allResults.stats.total + suiteResults.stats.total
    allResults.stats.passed = allResults.stats.passed + suiteResults.stats.passed
    allResults.stats.failed = allResults.stats.failed + suiteResults.stats.failed
    allResults.stats.skipped = allResults.stats.skipped + suiteResults.stats.skipped
  end
  
  allResults.stats.duration = (os.clock() - startTime) * 1000
  allResults.stats.success = allResults.stats.failed == 0
  return allResults
end

return M
`
}

function getHelpersModule(): string {
  return `
local M = {}

function M.generateTestData(template, count)
  local data = {}
  count = count or 10
  for i = 1, count do
    local item = {}
    for k, v in pairs(template) do
      if type(v) == "function" then item[k] = v(i)
      elseif type(v) == "string" and v:match("^%$") then
        local varName = v:sub(2)
        if varName == "index" then item[k] = i
        elseif varName == "random" then item[k] = math.random(1, 1000)
        else item[k] = v end
      else item[k] = v end
    end
    data[#data + 1] = item
  end
  return data
end

M.table = {}
function M.table.clone(t)
  if type(t) ~= "table" then return t end
  local copy = {}
  for k, v in pairs(t) do copy[k] = M.table.clone(v) end
  return setmetatable(copy, getmetatable(t))
end

function M.table.merge(...)
  local result = {}
  for _, t in ipairs({...}) do
    if type(t) == "table" then for k, v in pairs(t) do result[k] = v end end
  end
  return result
end

function M.table.keys(t)
  local keys = {}
  for k in pairs(t) do keys[#keys + 1] = k end
  return keys
end

function M.table.values(t)
  local values = {}
  for _, v in pairs(t) do values[#values + 1] = v end
  return values
end

function M.table.size(t)
  local count = 0
  for _ in pairs(t) do count = count + 1 end
  return count
end

M.string = {}
function M.string.trim(s) return s:match("^%s*(.-)%s*$") end
function M.string.split(s, delimiter)
  delimiter = delimiter or "%s"
  local result = {}
  for match in (s .. delimiter):gmatch("(.-)" .. delimiter) do result[#result + 1] = match end
  return result
end
function M.string.startsWith(s, prefix) return s:sub(1, #prefix) == prefix end
function M.string.endsWith(s, suffix) return suffix == "" or s:sub(-#suffix) == suffix end

return M
`
}

function getJsonParserModule(): string {
  return `
local M = {}

function M.decode(str)
  local pos = 1
  
  local function skip_whitespace()
    while pos <= #str and str:sub(pos, pos):match("%s") do pos = pos + 1 end
  end
  
  local function parse_string()
    pos = pos + 1
    local start = pos
    while pos <= #str do
      local c = str:sub(pos, pos)
      if c == '"' then
        local result = str:sub(start, pos - 1)
        pos = pos + 1
        result = result:gsub("\\\\n", "\\n"):gsub("\\\\t", "\\t"):gsub("\\\\r", "\\r")
        result = result:gsub('\\\\"', '"'):gsub("\\\\\\\\\\\\\\\\", "\\\\")
        return result
      elseif c == "\\\\" then pos = pos + 2
      else pos = pos + 1 end
    end
    error("Unterminated string")
  end
  
  local function parse_number()
    local start = pos
    while pos <= #str and str:sub(pos, pos):match("[%d%.eE%+%-]") do pos = pos + 1 end
    return tonumber(str:sub(start, pos - 1))
  end
  
  local parse_value
  
  local function parse_array()
    pos = pos + 1
    local arr = {}
    skip_whitespace()
    if str:sub(pos, pos) == "]" then pos = pos + 1 return arr end
    while true do
      skip_whitespace()
      arr[#arr + 1] = parse_value()
      skip_whitespace()
      local c = str:sub(pos, pos)
      if c == "]" then pos = pos + 1 return arr
      elseif c == "," then pos = pos + 1
      else error("Expected ',' or ']' at pos " .. pos) end
    end
  end
  
  local function parse_object()
    pos = pos + 1
    local obj = {}
    skip_whitespace()
    if str:sub(pos, pos) == "}" then pos = pos + 1 return obj end
    while true do
      skip_whitespace()
      if str:sub(pos, pos) ~= '"' then error("Expected string key at pos " .. pos) end
      local key = parse_string()
      skip_whitespace()
      if str:sub(pos, pos) ~= ":" then error("Expected ':' at pos " .. pos) end
      pos = pos + 1
      skip_whitespace()
      obj[key] = parse_value()
      skip_whitespace()
      local c = str:sub(pos, pos)
      if c == "}" then pos = pos + 1 return obj
      elseif c == "," then pos = pos + 1
      else error("Expected ',' or '}' at pos " .. pos) end
    end
  end
  
  parse_value = function()
    skip_whitespace()
    local c = str:sub(pos, pos)
    if c == '"' then return parse_string()
    elseif c == "{" then return parse_object()
    elseif c == "[" then return parse_array()
    elseif c == "t" and str:sub(pos, pos + 3) == "true" then pos = pos + 4 return true
    elseif c == "f" and str:sub(pos, pos + 4) == "false" then pos = pos + 5 return false
    elseif c == "n" and str:sub(pos, pos + 3) == "null" then pos = pos + 4 return nil
    elseif c:match("[%d%-]") then return parse_number()
    else error("Unexpected char '" .. c .. "' at pos " .. pos) end
  end
  
  return parse_value()
end

return M
`
}
