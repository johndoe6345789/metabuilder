-- Test runner and reporter
-- Executes test suites and generates reports

local M = {}

-- Result types
M.STATUS = {
  PASSED = "passed",
  FAILED = "failed",
  SKIPPED = "skipped",
  PENDING = "pending"
}

-- Run a single test
function M.runTest(test, hooks)
  local result = {
    name = test.name,
    status = M.STATUS.PENDING,
    error = nil,
    duration = 0
  }
  
  if test.skipped then
    result.status = M.STATUS.SKIPPED
    return result
  end
  
  local startTime = os.clock()
  
  -- Run beforeEach hook
  if hooks.beforeEach then
    local success, err = pcall(hooks.beforeEach)
    if not success then
      result.status = M.STATUS.FAILED
      result.error = "beforeEach failed: " .. tostring(err)
      result.duration = (os.clock() - startTime) * 1000
      return result
    end
  end
  
  -- Run the test
  local success, err = pcall(test.fn)
  
  -- Run afterEach hook
  if hooks.afterEach then
    pcall(hooks.afterEach)
  end
  
  result.duration = (os.clock() - startTime) * 1000
  
  if success then
    result.status = M.STATUS.PASSED
  else
    result.status = M.STATUS.FAILED
    if type(err) == "table" and err.type == "AssertionError" then
      result.error = err.message
      result.expected = err.expected
      result.actual = err.actual
    else
      result.error = tostring(err)
    end
  end
  
  return result
end

-- Run a test suite
function M.runSuite(suite, config, parentHooks)
  local results = {
    name = suite.name,
    tests = {},
    nested = {},
    stats = {
      total = 0,
      passed = 0,
      failed = 0,
      skipped = 0,
      duration = 0
    }
  }
  
  config = config or {}
  parentHooks = parentHooks or {}
  
  local startTime = os.clock()
  
  -- Combine hooks with parent hooks
  local hooks = {
    beforeEach = suite.beforeEach or parentHooks.beforeEach,
    afterEach = suite.afterEach or parentHooks.afterEach
  }
  
  -- Run beforeAll hook
  if suite.beforeAll then
    local success, err = pcall(suite.beforeAll)
    if not success then
      -- Mark all tests as failed
      for _, test in ipairs(suite.tests) do
        results.tests[#results.tests + 1] = {
          name = test.name,
          status = M.STATUS.FAILED,
          error = "beforeAll failed: " .. tostring(err),
          duration = 0
        }
        results.stats.failed = results.stats.failed + 1
        results.stats.total = results.stats.total + 1
      end
      results.stats.duration = (os.clock() - startTime) * 1000
      return results
    end
  end
  
  -- Check for .only tests
  local hasOnly = false
  for _, test in ipairs(suite.tests) do
    if test.only then
      hasOnly = true
      break
    end
  end
  
  -- Run tests
  for _, test in ipairs(suite.tests) do
    -- Skip if there's an "only" test and this isn't it
    if hasOnly and not test.only then
      local skipResult = {
        name = test.name,
        status = M.STATUS.SKIPPED,
        duration = 0
      }
      results.tests[#results.tests + 1] = skipResult
      results.stats.skipped = results.stats.skipped + 1
    -- Apply filter if configured
    elseif config.filter and not string.find(test.name, config.filter, 1, true) then
      local skipResult = {
        name = test.name,
        status = M.STATUS.SKIPPED,
        duration = 0
      }
      results.tests[#results.tests + 1] = skipResult
      results.stats.skipped = results.stats.skipped + 1
    else
      local testResult = M.runTest(test, hooks)
      results.tests[#results.tests + 1] = testResult
      
      if testResult.status == M.STATUS.PASSED then
        results.stats.passed = results.stats.passed + 1
      elseif testResult.status == M.STATUS.FAILED then
        results.stats.failed = results.stats.failed + 1
        if config.stopOnFirstFailure then
          break
        end
      elseif testResult.status == M.STATUS.SKIPPED then
        results.stats.skipped = results.stats.skipped + 1
      end
    end
    
    results.stats.total = results.stats.total + 1
  end
  
  -- Run nested suites
  for _, nestedSuite in ipairs(suite.nested) do
    local nestedResults = M.runSuite(nestedSuite, config, hooks)
    results.nested[#results.nested + 1] = nestedResults
    
    -- Aggregate stats
    results.stats.total = results.stats.total + nestedResults.stats.total
    results.stats.passed = results.stats.passed + nestedResults.stats.passed
    results.stats.failed = results.stats.failed + nestedResults.stats.failed
    results.stats.skipped = results.stats.skipped + nestedResults.stats.skipped
  end
  
  -- Run afterAll hook
  if suite.afterAll then
    pcall(suite.afterAll)
  end
  
  results.stats.duration = (os.clock() - startTime) * 1000
  
  return results
end

-- Run all suites
function M.runAll(suites, config)
  local allResults = {
    suites = {},
    stats = {
      total = 0,
      passed = 0,
      failed = 0,
      skipped = 0,
      duration = 0,
      suiteCount = 0
    },
    timestamp = os.date("%Y-%m-%dT%H:%M:%S")
  }
  
  local startTime = os.clock()
  
  for _, suite in ipairs(suites) do
    local suiteResults = M.runSuite(suite, config)
    allResults.suites[#allResults.suites + 1] = suiteResults
    allResults.stats.suiteCount = allResults.stats.suiteCount + 1
    
    -- Aggregate stats
    allResults.stats.total = allResults.stats.total + suiteResults.stats.total
    allResults.stats.passed = allResults.stats.passed + suiteResults.stats.passed
    allResults.stats.failed = allResults.stats.failed + suiteResults.stats.failed
    allResults.stats.skipped = allResults.stats.skipped + suiteResults.stats.skipped
  end
  
  allResults.stats.duration = (os.clock() - startTime) * 1000
  allResults.stats.success = allResults.stats.failed == 0
  
  return allResults
end

-- Format results as text report
function M.formatReport(results, options)
  options = options or {}
  local indent = options.indent or ""
  local verbose = options.verbose ~= false
  local lines = {}
  
  local function add(line)
    lines[#lines + 1] = line
  end
  
  local function formatSuite(suite, depth)
    local prefix = string.rep("  ", depth)
    add(prefix .. "📦 " .. suite.name)
    
    for _, test in ipairs(suite.tests) do
      local icon = "⏳"
      if test.status == M.STATUS.PASSED then
        icon = "✅"
      elseif test.status == M.STATUS.FAILED then
        icon = "❌"
      elseif test.status == M.STATUS.SKIPPED then
        icon = "⏭️"
      end
      
      local duration = string.format("(%.2fms)", test.duration)
      add(prefix .. "  " .. icon .. " " .. test.name .. " " .. duration)
      
      if test.status == M.STATUS.FAILED and verbose then
        add(prefix .. "      Error: " .. (test.error or "Unknown error"))
        if test.expected then
          add(prefix .. "      Expected: " .. tostring(test.expected))
        end
        if test.actual then
          add(prefix .. "      Actual: " .. tostring(test.actual))
        end
      end
    end
    
    for _, nested in ipairs(suite.nested) do
      formatSuite(nested, depth + 1)
    end
  end
  
  add("═══════════════════════════════════════")
  add("          TEST RESULTS REPORT          ")
  add("═══════════════════════════════════════")
  add("")
  
  for _, suite in ipairs(results.suites) do
    formatSuite(suite, 0)
    add("")
  end
  
  add("───────────────────────────────────────")
  add("Summary:")
  add(string.format("  Total:   %d tests", results.stats.total))
  add(string.format("  Passed:  %d ✅", results.stats.passed))
  add(string.format("  Failed:  %d ❌", results.stats.failed))
  add(string.format("  Skipped: %d ⏭️", results.stats.skipped))
  add(string.format("  Duration: %.2fms", results.stats.duration))
  add("")
  
  if results.stats.success then
    add("🎉 All tests passed!")
  else
    add("💥 Some tests failed!")
  end
  
  add("═══════════════════════════════════════")
  
  return table.concat(lines, "\n")
end

-- Format results as JSON
function M.formatJSON(results)
  -- Simple JSON serialization
  local function serialize(value, indent)
    indent = indent or 0
    local t = type(value)
    
    if t == "nil" then
      return "null"
    elseif t == "boolean" then
      return value and "true" or "false"
    elseif t == "number" then
      return tostring(value)
    elseif t == "string" then
      return '"' .. value:gsub('"', '\\"'):gsub("\n", "\\n") .. '"'
    elseif t == "table" then
      local parts = {}
      local isArray = #value > 0 or next(value) == nil
      
      if isArray then
        for _, v in ipairs(value) do
          parts[#parts + 1] = serialize(v, indent + 1)
        end
        return "[" .. table.concat(parts, ",") .. "]"
      else
        for k, v in pairs(value) do
          parts[#parts + 1] = '"' .. tostring(k) .. '":' .. serialize(v, indent + 1)
        end
        return "{" .. table.concat(parts, ",") .. "}"
      end
    end
    
    return '"<' .. t .. '>"'
  end
  
  return serialize(results)
end

return M
