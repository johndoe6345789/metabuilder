-- Suite runner
-- Executes test suites with nested suite support

local STATUS = require("test_status")
local run_test = require("run_test")

---@class SuiteRunnerModule
local M = {}

---@class SuiteStats
---@field total number Total test count
---@field passed number Passed test count
---@field failed number Failed test count
---@field skipped number Skipped test count
---@field duration number Suite duration in ms

---@class SuiteResults
---@field name string Suite name
---@field tests TestResult[] Test results
---@field nested SuiteResults[] Nested suite results
---@field stats SuiteStats Statistics

---Run a test suite
---@param suite TestSuite Suite to run
---@param config? TestConfig Run configuration
---@param parentHooks? TestHooks Parent suite hooks
---@return SuiteResults Suite execution results
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
      for _, test in ipairs(suite.tests) do
        results.tests[#results.tests + 1] = {
          name = test.name,
          status = STATUS.FAILED,
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
    if hasOnly and not test.only then
      local skipResult = {
        name = test.name,
        status = STATUS.SKIPPED,
        duration = 0
      }
      results.tests[#results.tests + 1] = skipResult
      results.stats.skipped = results.stats.skipped + 1
    elseif config.filter and not string.find(test.name, config.filter, 1, true) then
      local skipResult = {
        name = test.name,
        status = STATUS.SKIPPED,
        duration = 0
      }
      results.tests[#results.tests + 1] = skipResult
      results.stats.skipped = results.stats.skipped + 1
    else
      local testResult = run_test.runTest(test, hooks)
      results.tests[#results.tests + 1] = testResult
      
      if testResult.status == STATUS.PASSED then
        results.stats.passed = results.stats.passed + 1
      elseif testResult.status == STATUS.FAILED then
        results.stats.failed = results.stats.failed + 1
        if config.stopOnFirstFailure then
          break
        end
      elseif testResult.status == STATUS.SKIPPED then
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

---Run all suites
---@param suites TestSuite[] Array of suites to run
---@param config? TestConfig Run configuration
---@return table All results with aggregated stats
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
