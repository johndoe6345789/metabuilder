-- package_validator/seed/scripts/db/operations.lua
-- DBAL operations for Package validation results
-- @module package_validator.db.operations

local M = {}
local json = require('json')

---------------------------------------------------------------------------
-- VALIDATION RUN OPERATIONS
---------------------------------------------------------------------------

---@class ValidationRunParams
---@field tenantId string
---@field packageName string
---@field packageVersion string|nil
---@field status string (pending, running, completed, failed)
---@field results table|nil Validation results

---Create validation run
---@param dbal table DBAL client instance
---@param params ValidationRunParams
---@return table Created run
function M.createRun(dbal, params)
  return dbal:create('ValidationRun', {
    tenantId = params.tenantId,
    packageName = params.packageName,
    packageVersion = params.packageVersion,
    status = params.status or 'pending',
    results = params.results and json.encode(params.results) or nil,
    startedAt = os.time() * 1000,
  })
end

---Get validation run by ID
---@param dbal table
---@param runId string
---@return table|nil Run
function M.getRun(dbal, runId)
  local run = dbal:read('ValidationRun', runId)
  if run and run.results then
    run.results = json.decode(run.results)
  end
  return run
end

---Update run status
---@param dbal table
---@param runId string
---@param status string
---@param results table|nil
function M.updateRunStatus(dbal, runId, status, results)
  local updates = {
    status = status,
  }
  
  if results then
    updates.results = json.encode(results)
  end
  
  if status == 'completed' or status == 'failed' then
    updates.completedAt = os.time() * 1000
  end
  
  return dbal:update('ValidationRun', runId, updates)
end

---List runs for package
---@param dbal table
---@param tenantId string
---@param packageName string
---@param take number|nil
---@return table[] Runs
function M.listRuns(dbal, tenantId, packageName, take)
  local result = dbal:list('ValidationRun', {
    where = { tenantId = tenantId, packageName = packageName },
    orderBy = { startedAt = 'desc' },
    take = take or 20,
  })
  
  return result.items or {}
end

---Get latest run for package
---@param dbal table
---@param tenantId string
---@param packageName string
---@return table|nil Latest run
function M.getLatestRun(dbal, tenantId, packageName)
  local runs = M.listRuns(dbal, tenantId, packageName, 1)
  if #runs > 0 then
    local run = runs[1]
    if run.results then
      run.results = json.decode(run.results)
    end
    return run
  end
  return nil
end

---------------------------------------------------------------------------
-- VALIDATION ISSUE OPERATIONS
---------------------------------------------------------------------------

---@class ValidationIssue
---@field runId string
---@field severity string (error, warning, info)
---@field code string Issue code
---@field message string
---@field file string|nil
---@field line number|nil
---@field suggestion string|nil

---Add validation issue
---@param dbal table
---@param issue ValidationIssue
---@return table Created issue
function M.addIssue(dbal, issue)
  return dbal:create('ValidationIssue', {
    runId = issue.runId,
    severity = issue.severity,
    code = issue.code,
    message = issue.message,
    file = issue.file,
    line = issue.line,
    suggestion = issue.suggestion,
    createdAt = os.time() * 1000,
  })
end

---Add multiple issues
---@param dbal table
---@param runId string
---@param issues table[] Array of issues
function M.addIssues(dbal, runId, issues)
  for _, issue in ipairs(issues) do
    issue.runId = runId
    M.addIssue(dbal, issue)
  end
end

---Get issues for run
---@param dbal table
---@param runId string
---@param severity string|nil Filter by severity
---@return table[] Issues
function M.getIssues(dbal, runId, severity)
  local where = { runId = runId }
  
  local result = dbal:list('ValidationIssue', {
    where = where,
    orderBy = { severity = 'asc' },
    take = 500,
  })
  
  local issues = result.items or {}
  
  if severity then
    local filtered = {}
    for _, issue in ipairs(issues) do
      if issue.severity == severity then
        table.insert(filtered, issue)
      end
    end
    issues = filtered
  end
  
  return issues
end

---Count issues by severity
---@param dbal table
---@param runId string
---@return table Counts by severity
function M.countIssues(dbal, runId)
  local issues = M.getIssues(dbal, runId)
  
  local counts = {
    error = 0,
    warning = 0,
    info = 0,
    total = #issues,
  }
  
  for _, issue in ipairs(issues) do
    local sev = issue.severity
    if counts[sev] then
      counts[sev] = counts[sev] + 1
    end
  end
  
  return counts
end

---------------------------------------------------------------------------
-- VALIDATION RULE OPERATIONS
---------------------------------------------------------------------------

---@class ValidationRuleParams
---@field tenantId string
---@field name string
---@field code string Unique rule code
---@field severity string
---@field description string
---@field check string Lua function body
---@field enabled boolean|nil

---Create validation rule
---@param dbal table
---@param params ValidationRuleParams
---@return table Created rule
function M.createRule(dbal, params)
  return dbal:create('ValidationRule', {
    tenantId = params.tenantId,
    name = params.name,
    code = params.code,
    severity = params.severity,
    description = params.description,
    check = params.check,
    enabled = params.enabled ~= false,
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---Get rule by code
---@param dbal table
---@param tenantId string
---@param code string
---@return table|nil Rule
function M.getRule(dbal, tenantId, code)
  return dbal:findFirst('ValidationRule', {
    where = { tenantId = tenantId, code = code },
  })
end

---List enabled rules
---@param dbal table
---@param tenantId string
---@return table[] Rules
function M.listEnabledRules(dbal, tenantId)
  local result = dbal:list('ValidationRule', {
    where = { tenantId = tenantId, enabled = true },
    orderBy = { code = 'asc' },
    take = 100,
  })
  
  return result.items or {}
end

---Update rule
---@param dbal table
---@param tenantId string
---@param code string
---@param updates table
function M.updateRule(dbal, tenantId, code, updates)
  local rule = M.getRule(dbal, tenantId, code)
  if rule then
    updates.updatedAt = os.time() * 1000
    return dbal:update('ValidationRule', rule.id, updates)
  end
  return nil
end

---Toggle rule enabled status
---@param dbal table
---@param tenantId string
---@param code string
---@param enabled boolean
function M.setRuleEnabled(dbal, tenantId, code, enabled)
  return M.updateRule(dbal, tenantId, code, { enabled = enabled })
end

---------------------------------------------------------------------------
-- PACKAGE REGISTRY OPERATIONS
---------------------------------------------------------------------------

---Get package validation summary
---@param dbal table
---@param tenantId string
---@param packageName string
---@return table Summary
function M.getPackageSummary(dbal, tenantId, packageName)
  local latestRun = M.getLatestRun(dbal, tenantId, packageName)
  
  if not latestRun then
    return {
      packageName = packageName,
      status = 'never_validated',
      lastValidated = nil,
      issueCounts = nil,
    }
  end
  
  local counts = M.countIssues(dbal, latestRun.id)
  
  return {
    packageName = packageName,
    status = latestRun.status,
    lastValidated = latestRun.completedAt or latestRun.startedAt,
    issueCounts = counts,
    hasErrors = counts.error > 0,
  }
end

---Get all packages validation status
---@param dbal table
---@param tenantId string
---@return table[] Package summaries
function M.getAllPackageStatus(dbal, tenantId)
  -- Get unique package names from runs
  local result = dbal:list('ValidationRun', {
    where = { tenantId = tenantId },
    orderBy = { packageName = 'asc' },
    take = 10000,
  })
  
  local packageNames = {}
  local seen = {}
  
  for _, run in ipairs(result.items or {}) do
    if not seen[run.packageName] then
      seen[run.packageName] = true
      table.insert(packageNames, run.packageName)
    end
  end
  
  local summaries = {}
  for _, name in ipairs(packageNames) do
    table.insert(summaries, M.getPackageSummary(dbal, tenantId, name))
  end
  
  return summaries
end

return M
