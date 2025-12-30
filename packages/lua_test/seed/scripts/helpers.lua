-- Test helper utilities
-- Additional utilities for writing tests

local M = {}

-- Generate test data
function M.generateTestData(template, count)
  local data = {}
  count = count or 10
  
  for i = 1, count do
    local item = {}
    for k, v in pairs(template) do
      if type(v) == "function" then
        item[k] = v(i)
      elseif type(v) == "string" and v:match("^%$") then
        -- Template variables
        local varName = v:sub(2)
        if varName == "index" then
          item[k] = i
        elseif varName == "random" then
          item[k] = math.random(1, 1000)
        elseif varName == "uuid" then
          item[k] = string.format("%08x-%04x-%04x-%04x-%012x",
            math.random(0, 0xffffffff),
            math.random(0, 0xffff),
            math.random(0, 0xffff),
            math.random(0, 0xffff),
            math.random(0, 0xffffffffffff))
        else
          item[k] = v
        end
      else
        item[k] = v
      end
    end
    data[#data + 1] = item
  end
  
  return data
end

-- Create parameterized test cases
function M.parameterized(cases, testFn)
  return function()
    for _, testCase in ipairs(cases) do
      testFn(testCase)
    end
  end
end

-- Wait for condition (for async-like testing)
function M.waitFor(condition, options)
  options = options or {}
  local timeout = options.timeout or 1000
  local interval = options.interval or 10
  local startTime = os.clock() * 1000
  
  while (os.clock() * 1000 - startTime) < timeout do
    if condition() then
      return true
    end
    -- Note: In sandbox, we can't actually sleep, but this provides the pattern
  end
  
  if options.throwOnTimeout ~= false then
    error("waitFor timed out after " .. timeout .. "ms")
  end
  
  return false
end

-- Snapshot testing helper
function M.createSnapshot(name)
  local snapshots = {}
  
  return {
    -- Record a snapshot
    record = function(key, value)
      snapshots[key] = M.serialize(value)
    end,
    
    -- Match against recorded snapshot
    match = function(key, value)
      local serialized = M.serialize(value)
      if snapshots[key] then
        return snapshots[key] == serialized
      end
      -- First run - record the snapshot
      snapshots[key] = serialized
      return true
    end,
    
    -- Get all snapshots
    getSnapshots = function()
      return snapshots
    end,
    
    -- Update a snapshot
    update = function(key, value)
      snapshots[key] = M.serialize(value)
    end
  }
end

-- Serialize value for comparison
function M.serialize(value, seen)
  seen = seen or {}
  local t = type(value)
  
  if t == "nil" then
    return "nil"
  elseif t == "boolean" then
    return value and "true" or "false"
  elseif t == "number" then
    return tostring(value)
  elseif t == "string" then
    return string.format("%q", value)
  elseif t == "table" then
    if seen[value] then
      return "<circular>"
    end
    seen[value] = true
    
    local parts = {}
    local keys = {}
    
    for k in pairs(value) do
      keys[#keys + 1] = k
    end
    
    table.sort(keys, function(a, b)
      return tostring(a) < tostring(b)
    end)
    
    for _, k in ipairs(keys) do
      parts[#parts + 1] = "[" .. M.serialize(k, seen) .. "]=" .. M.serialize(value[k], seen)
    end
    
    return "{" .. table.concat(parts, ",") .. "}"
  else
    return "<" .. t .. ">"
  end
end

-- Table utilities for testing
M.table = {}

function M.table.clone(t)
  if type(t) ~= "table" then return t end
  local copy = {}
  for k, v in pairs(t) do
    copy[k] = M.table.clone(v)
  end
  return setmetatable(copy, getmetatable(t))
end

function M.table.merge(...)
  local result = {}
  for _, t in ipairs({...}) do
    if type(t) == "table" then
      for k, v in pairs(t) do
        result[k] = v
      end
    end
  end
  return result
end

function M.table.keys(t)
  local keys = {}
  for k in pairs(t) do
    keys[#keys + 1] = k
  end
  return keys
end

function M.table.values(t)
  local values = {}
  for _, v in pairs(t) do
    values[#values + 1] = v
  end
  return values
end

function M.table.size(t)
  local count = 0
  for _ in pairs(t) do
    count = count + 1
  end
  return count
end

-- String utilities for testing
M.string = {}

function M.string.trim(s)
  return s:match("^%s*(.-)%s*$")
end

function M.string.split(s, delimiter)
  delimiter = delimiter or "%s"
  local result = {}
  for match in (s .. delimiter):gmatch("(.-)" .. delimiter) do
    result[#result + 1] = match
  end
  return result
end

function M.string.startsWith(s, prefix)
  return s:sub(1, #prefix) == prefix
end

function M.string.endsWith(s, suffix)
  return suffix == "" or s:sub(-#suffix) == suffix
end

-- Assertion shortcuts for common patterns
function M.assertThrows(fn, expectedMessage)
  local success, err = pcall(fn)
  if success then
    error("Expected function to throw, but it didn't")
  end
  if expectedMessage then
    local errStr = type(err) == "table" and err.message or tostring(err)
    if not string.find(errStr, expectedMessage, 1, true) then
      error("Expected error to contain: " .. expectedMessage .. ", got: " .. errStr)
    end
  end
  return err
end

function M.assertDoesNotThrow(fn)
  local success, err = pcall(fn)
  if not success then
    error("Expected function not to throw, but got: " .. tostring(err))
  end
end

-- Test context builder
function M.createContext(initial)
  local ctx = initial or {}
  
  return {
    get = function(key)
      return ctx[key]
    end,
    
    set = function(key, value)
      ctx[key] = value
    end,
    
    with = function(overrides)
      return M.table.merge(ctx, overrides)
    end,
    
    reset = function()
      ctx = initial and M.table.clone(initial) or {}
    end,
    
    getAll = function()
      return M.table.clone(ctx)
    end
  }
end

return M
