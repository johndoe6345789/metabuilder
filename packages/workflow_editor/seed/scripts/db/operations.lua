-- workflow_editor/seed/scripts/db/operations.lua
-- DBAL operations for Workflow entities
-- @module workflow_editor.db.operations

local M = {}
local json = require('json')

---------------------------------------------------------------------------
-- WORKFLOW OPERATIONS
---------------------------------------------------------------------------

---@class WorkflowCreateParams
---@field tenantId string
---@field name string
---@field description string|nil
---@field trigger table Trigger configuration
---@field nodes table[] Workflow nodes
---@field edges table[] Node connections
---@field createdBy string

---Create a new workflow
---@param dbal table DBAL client instance
---@param params WorkflowCreateParams
---@return table Created workflow
function M.createWorkflow(dbal, params)
  return dbal:create('Workflow', {
    tenantId = params.tenantId,
    name = params.name,
    description = params.description,
    status = 'draft',
    version = 1,
    trigger = json.encode(params.trigger or {}),
    nodes = json.encode(params.nodes or {}),
    edges = json.encode(params.edges or {}),
    createdBy = params.createdBy,
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---Get workflow by ID
---@param dbal table
---@param workflowId string
---@return table|nil Workflow with parsed JSON
function M.getWorkflow(dbal, workflowId)
  local workflow = dbal:read('Workflow', workflowId)
  if workflow then
    workflow.trigger = json.decode(workflow.trigger or '{}')
    workflow.nodes = json.decode(workflow.nodes or '[]')
    workflow.edges = json.decode(workflow.edges or '[]')
  end
  return workflow
end

---List workflows
---@param dbal table
---@param tenantId string
---@param status string|nil draft|active|paused|archived
---@param take number|nil
---@param skip number|nil
---@return table List result
function M.listWorkflows(dbal, tenantId, status, take, skip)
  local where = { tenantId = tenantId }
  
  if status then
    where.status = status
  end
  
  local result = dbal:list('Workflow', {
    where = where,
    orderBy = { updatedAt = 'desc' },
    take = take or 20,
    skip = skip or 0,
  })
  
  return result
end

---Update workflow
---@param dbal table
---@param workflowId string
---@param updates table
---@return table Updated workflow
function M.updateWorkflow(dbal, workflowId, updates)
  if updates.trigger and type(updates.trigger) == 'table' then
    updates.trigger = json.encode(updates.trigger)
  end
  if updates.nodes and type(updates.nodes) == 'table' then
    updates.nodes = json.encode(updates.nodes)
  end
  if updates.edges and type(updates.edges) == 'table' then
    updates.edges = json.encode(updates.edges)
  end
  
  updates.updatedAt = os.time() * 1000
  return dbal:update('Workflow', workflowId, updates)
end

---Save workflow nodes and edges
---@param dbal table
---@param workflowId string
---@param nodes table[]
---@param edges table[]
---@return table Updated workflow
function M.saveWorkflowGraph(dbal, workflowId, nodes, edges)
  return M.updateWorkflow(dbal, workflowId, {
    nodes = nodes,
    edges = edges,
  })
end

---Publish workflow (activate)
---@param dbal table
---@param workflowId string
---@return table Updated workflow
function M.publishWorkflow(dbal, workflowId)
  local workflow = M.getWorkflow(dbal, workflowId)
  if not workflow then
    error('Workflow not found: ' .. workflowId)
  end
  
  return M.updateWorkflow(dbal, workflowId, {
    status = 'active',
    version = (workflow.version or 0) + 1,
    publishedAt = os.time() * 1000,
  })
end

---Pause workflow
---@param dbal table
---@param workflowId string
function M.pauseWorkflow(dbal, workflowId)
  return M.updateWorkflow(dbal, workflowId, { status = 'paused' })
end

---Resume workflow
---@param dbal table
---@param workflowId string
function M.resumeWorkflow(dbal, workflowId)
  return M.updateWorkflow(dbal, workflowId, { status = 'active' })
end

---Archive workflow
---@param dbal table
---@param workflowId string
function M.archiveWorkflow(dbal, workflowId)
  return M.updateWorkflow(dbal, workflowId, { status = 'archived' })
end

---Delete workflow
---@param dbal table
---@param workflowId string
---@return boolean Success
function M.deleteWorkflow(dbal, workflowId)
  return dbal:delete('Workflow', workflowId)
end

---------------------------------------------------------------------------
-- WORKFLOW EXECUTION OPERATIONS
---------------------------------------------------------------------------

---@class WorkflowExecutionParams
---@field tenantId string
---@field workflowId string
---@field triggeredBy string|nil User or system
---@field input table|nil Input data

---Start a workflow execution
---@param dbal table
---@param params WorkflowExecutionParams
---@return table Created execution
function M.startExecution(dbal, params)
  return dbal:create('WorkflowExecution', {
    tenantId = params.tenantId,
    workflowId = params.workflowId,
    status = 'running',
    triggeredBy = params.triggeredBy or 'system',
    input = params.input and json.encode(params.input) or nil,
    startedAt = os.time() * 1000,
  })
end

---Get execution by ID
---@param dbal table
---@param executionId string
---@return table|nil Execution
function M.getExecution(dbal, executionId)
  local execution = dbal:read('WorkflowExecution', executionId)
  if execution then
    if execution.input then
      execution.input = json.decode(execution.input)
    end
    if execution.output then
      execution.output = json.decode(execution.output)
    end
  end
  return execution
end

---List executions for a workflow
---@param dbal table
---@param workflowId string
---@param status string|nil running|completed|failed|cancelled
---@param take number|nil
---@return table List result
function M.listExecutions(dbal, workflowId, status, take)
  local where = { workflowId = workflowId }
  
  if status then
    where.status = status
  end
  
  return dbal:list('WorkflowExecution', {
    where = where,
    orderBy = { startedAt = 'desc' },
    take = take or 20,
  })
end

---Update execution status
---@param dbal table
---@param executionId string
---@param status string
---@param output table|nil
---@param error string|nil
function M.updateExecution(dbal, executionId, status, output, error)
  local updates = { status = status }
  
  if status == 'completed' or status == 'failed' or status == 'cancelled' then
    updates.completedAt = os.time() * 1000
  end
  
  if output then
    updates.output = json.encode(output)
  end
  
  if error then
    updates.error = error
  end
  
  return dbal:update('WorkflowExecution', executionId, updates)
end

---Complete execution
---@param dbal table
---@param executionId string
---@param output table|nil
function M.completeExecution(dbal, executionId, output)
  return M.updateExecution(dbal, executionId, 'completed', output, nil)
end

---Fail execution
---@param dbal table
---@param executionId string
---@param error string
function M.failExecution(dbal, executionId, error)
  return M.updateExecution(dbal, executionId, 'failed', nil, error)
end

---Cancel execution
---@param dbal table
---@param executionId string
function M.cancelExecution(dbal, executionId)
  return M.updateExecution(dbal, executionId, 'cancelled', nil, nil)
end

---------------------------------------------------------------------------
-- NODE STEP LOGGING
---------------------------------------------------------------------------

---Log a node step
---@param dbal table
---@param executionId string
---@param nodeId string
---@param status string pending|running|completed|failed|skipped
---@param input table|nil
---@param output table|nil
---@param error string|nil
function M.logNodeStep(dbal, executionId, nodeId, status, input, output, error)
  return dbal:create('WorkflowStep', {
    executionId = executionId,
    nodeId = nodeId,
    status = status,
    input = input and json.encode(input) or nil,
    output = output and json.encode(output) or nil,
    error = error,
    timestamp = os.time() * 1000,
  })
end

---Get steps for an execution
---@param dbal table
---@param executionId string
---@return table[] Steps in order
function M.getExecutionSteps(dbal, executionId)
  local result = dbal:list('WorkflowStep', {
    where = { executionId = executionId },
    orderBy = { timestamp = 'asc' },
    take = 1000,
  })
  return result.items or {}
end

---------------------------------------------------------------------------
-- WORKFLOW TEMPLATES
---------------------------------------------------------------------------

---List workflow templates
---@param dbal table
---@param category string|nil
---@return table[] Templates
function M.listTemplates(dbal, category)
  local where = { isTemplate = true }
  
  local result = dbal:list('Workflow', {
    where = where,
    orderBy = { name = 'asc' },
    take = 50,
  })
  
  local templates = result.items or {}
  
  -- Filter by category if specified
  if category then
    local filtered = {}
    for _, t in ipairs(templates) do
      if t.category == category then
        table.insert(filtered, t)
      end
    end
    templates = filtered
  end
  
  return templates
end

---Create workflow from template
---@param dbal table
---@param templateId string
---@param tenantId string
---@param name string
---@param createdBy string
---@return table Created workflow
function M.createFromTemplate(dbal, templateId, tenantId, name, createdBy)
  local template = M.getWorkflow(dbal, templateId)
  if not template then
    error('Template not found: ' .. templateId)
  end
  
  return M.createWorkflow(dbal, {
    tenantId = tenantId,
    name = name,
    description = 'Created from template: ' .. template.name,
    trigger = template.trigger,
    nodes = template.nodes,
    edges = template.edges,
    createdBy = createdBy,
  })
end

return M
