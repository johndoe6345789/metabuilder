-- Test report formatters
-- Provides text and JSON report generation

local STATUS = require("test_status")

---@class ReporterModule
local M = {}

---@class ReportOptions
---@field indent? string Indentation string
---@field verbose? boolean Show detailed errors (default true)

---Format results as text report
---@param results table All results from runAll
---@param options? ReportOptions Formatting options
---@return string Formatted text report
function M.formatReport(results, options)
  options = options or {}
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
      if test.status == STATUS.PASSED then
        icon = "✅"
      elseif test.status == STATUS.FAILED then
        icon = "❌"
      elseif test.status == STATUS.SKIPPED then
        icon = "⏭️"
      end
      
      local duration = string.format("(%.2fms)", test.duration)
      add(prefix .. "  " .. icon .. " " .. test.name .. " " .. duration)
      
      if test.status == STATUS.FAILED and verbose then
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

---Format results as JSON string
---@param results table All results from runAll
---@return string JSON formatted results
function M.formatJSON(results)
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
