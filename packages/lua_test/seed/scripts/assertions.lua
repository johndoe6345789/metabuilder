-- Assertion functions for the test framework
-- Provides expect() with chainable matchers

local M = {}

-- Helper to get type with better nil handling
local function getType(value)
  if value == nil then return "nil" end
  return type(value)
end

-- Helper to stringify values for error messages
local function stringify(value)
  local t = type(value)
  if t == "string" then
    return '"' .. value .. '"'
  elseif t == "table" then
    local parts = {}
    for k, v in pairs(value) do
      parts[#parts + 1] = tostring(k) .. "=" .. stringify(v)
    end
    return "{" .. table.concat(parts, ", ") .. "}"
  elseif t == "nil" then
    return "nil"
  else
    return tostring(value)
  end
end

-- Deep equality check
local function deepEqual(a, b)
  if type(a) ~= type(b) then return false end
  if type(a) ~= "table" then return a == b end
  
  -- Check all keys in a exist in b with same values
  for k, v in pairs(a) do
    if not deepEqual(v, b[k]) then return false end
  end
  
  -- Check all keys in b exist in a
  for k, _ in pairs(b) do
    if a[k] == nil then return false end
  end
  
  return true
end

-- Create assertion error
local function assertionError(message, expected, actual)
  return {
    type = "AssertionError",
    message = message,
    expected = expected,
    actual = actual
  }
end

-- Expect wrapper with chainable matchers
function M.expect(actual)
  local expectation = {
    actual = actual,
    negated = false
  }
  
  -- Not modifier
  expectation.never = setmetatable({}, {
    __index = function(_, key)
      expectation.negated = true
      return expectation[key]
    end
  })
  
  -- toBe - strict equality
  function expectation.toBe(expected)
    local pass = actual == expected
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated 
        and "Expected " .. stringify(actual) .. " not to be " .. stringify(expected)
        or "Expected " .. stringify(actual) .. " to be " .. stringify(expected)
      error(assertionError(msg, expected, actual))
    end
    return true
  end
  
  -- toEqual - deep equality
  function expectation.toEqual(expected)
    local pass = deepEqual(actual, expected)
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected values not to be deeply equal"
        or "Expected values to be deeply equal"
      error(assertionError(msg, expected, actual))
    end
    return true
  end
  
  -- toBeNil
  function expectation.toBeNil()
    local pass = actual == nil
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected " .. stringify(actual) .. " not to be nil"
        or "Expected " .. stringify(actual) .. " to be nil"
      error(assertionError(msg, nil, actual))
    end
    return true
  end
  
  -- toBeTruthy
  function expectation.toBeTruthy()
    local pass = actual and true or false
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected " .. stringify(actual) .. " not to be truthy"
        or "Expected " .. stringify(actual) .. " to be truthy"
      error(assertionError(msg, "truthy", actual))
    end
    return true
  end
  
  -- toBeFalsy
  function expectation.toBeFalsy()
    local pass = not actual
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected " .. stringify(actual) .. " not to be falsy"
        or "Expected " .. stringify(actual) .. " to be falsy"
      error(assertionError(msg, "falsy", actual))
    end
    return true
  end
  
  -- toBeType
  function expectation.toBeType(expectedType)
    local actualType = getType(actual)
    local pass = actualType == expectedType
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected type not to be " .. expectedType .. ", got " .. actualType
        or "Expected type to be " .. expectedType .. ", got " .. actualType
      error(assertionError(msg, expectedType, actualType))
    end
    return true
  end
  
  -- toContain - for strings and tables
  function expectation.toContain(expected)
    local pass = false
    
    if type(actual) == "string" and type(expected) == "string" then
      pass = string.find(actual, expected, 1, true) ~= nil
    elseif type(actual) == "table" then
      for _, v in pairs(actual) do
        if deepEqual(v, expected) then
          pass = true
          break
        end
      end
    end
    
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected " .. stringify(actual) .. " not to contain " .. stringify(expected)
        or "Expected " .. stringify(actual) .. " to contain " .. stringify(expected)
      error(assertionError(msg, expected, actual))
    end
    return true
  end
  
  -- toHaveLength
  function expectation.toHaveLength(expectedLength)
    local actualLength
    if type(actual) == "string" then
      actualLength = #actual
    elseif type(actual) == "table" then
      actualLength = #actual
    else
      error("toHaveLength can only be used with strings or tables")
    end
    
    local pass = actualLength == expectedLength
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected length not to be " .. expectedLength .. ", got " .. actualLength
        or "Expected length to be " .. expectedLength .. ", got " .. actualLength
      error(assertionError(msg, expectedLength, actualLength))
    end
    return true
  end
  
  -- toBeGreaterThan
  function expectation.toBeGreaterThan(expected)
    local pass = actual > expected
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected " .. stringify(actual) .. " not to be greater than " .. stringify(expected)
        or "Expected " .. stringify(actual) .. " to be greater than " .. stringify(expected)
      error(assertionError(msg, "> " .. expected, actual))
    end
    return true
  end
  
  -- toBeLessThan
  function expectation.toBeLessThan(expected)
    local pass = actual < expected
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected " .. stringify(actual) .. " not to be less than " .. stringify(expected)
        or "Expected " .. stringify(actual) .. " to be less than " .. stringify(expected)
      error(assertionError(msg, "< " .. expected, actual))
    end
    return true
  end
  
  -- toBeCloseTo - for floating point comparison
  function expectation.toBeCloseTo(expected, precision)
    precision = precision or 2
    local diff = math.abs(actual - expected)
    local pass = diff < (10 ^ -precision) / 2
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected " .. actual .. " not to be close to " .. expected
        or "Expected " .. actual .. " to be close to " .. expected .. " (diff: " .. diff .. ")"
      error(assertionError(msg, expected, actual))
    end
    return true
  end
  
  -- toMatch - regex pattern matching
  function expectation.toMatch(pattern)
    if type(actual) ~= "string" then
      error("toMatch can only be used with strings")
    end
    
    local pass = string.match(actual, pattern) ~= nil
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected " .. stringify(actual) .. " not to match pattern " .. pattern
        or "Expected " .. stringify(actual) .. " to match pattern " .. pattern
      error(assertionError(msg, pattern, actual))
    end
    return true
  end
  
  -- toThrow - expects a function to throw
  function expectation.toThrow(expectedMessage)
    if type(actual) ~= "function" then
      error("toThrow can only be used with functions")
    end
    
    local success, err = pcall(actual)
    local pass = not success
    
    if pass and expectedMessage then
      local errMsg = type(err) == "table" and err.message or tostring(err)
      pass = string.find(errMsg, expectedMessage, 1, true) ~= nil
    end
    
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected function not to throw"
        or "Expected function to throw" .. (expectedMessage and " with message: " .. expectedMessage or "")
      error(assertionError(msg, expectedMessage or "error", success and "no error" or err))
    end
    return true
  end
  
  -- toHaveProperty
  function expectation.toHaveProperty(key, value)
    if type(actual) ~= "table" then
      error("toHaveProperty can only be used with tables")
    end
    
    local pass = actual[key] ~= nil
    if pass and value ~= nil then
      pass = deepEqual(actual[key], value)
    end
    
    if expectation.negated then pass = not pass end
    
    if not pass then
      local msg = expectation.negated
        and "Expected table not to have property " .. stringify(key)
        or "Expected table to have property " .. stringify(key) .. (value and " with value " .. stringify(value) or "")
      error(assertionError(msg, value, actual[key]))
    end
    return true
  end
  
  return expectation
end

-- Standalone assertion functions
function M.assertTrue(value, message)
  if not value then
    error(assertionError(message or "Expected true", true, value))
  end
end

function M.assertFalse(value, message)
  if value then
    error(assertionError(message or "Expected false", false, value))
  end
end

function M.assertEqual(actual, expected, message)
  if actual ~= expected then
    error(assertionError(message or "Values not equal", expected, actual))
  end
end

function M.assertNotEqual(actual, expected, message)
  if actual == expected then
    error(assertionError(message or "Values should not be equal", "not " .. stringify(expected), actual))
  end
end

function M.assertNil(value, message)
  if value ~= nil then
    error(assertionError(message or "Expected nil", nil, value))
  end
end

function M.assertNotNil(value, message)
  if value == nil then
    error(assertionError(message or "Expected not nil", "not nil", nil))
  end
end

function M.fail(message)
  error(assertionError(message or "Test failed", nil, nil))
end

return M
