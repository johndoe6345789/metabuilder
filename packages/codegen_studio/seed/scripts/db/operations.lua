-- codegen_studio/seed/scripts/db/operations.lua
-- DBAL operations for Codegen entities (Project, Blueprint, Template)
-- @module codegen_studio.db.operations

local M = {}
local json = require('json')

---------------------------------------------------------------------------
-- PROJECT OPERATIONS
---------------------------------------------------------------------------

---@class CodegenProjectCreateParams
---@field tenantId string
---@field name string
---@field description string|nil
---@field framework string react|vue|svelte|angular|etc
---@field settings table|nil
---@field createdBy string

---Create a new codegen project
---@param dbal table DBAL client instance
---@param params CodegenProjectCreateParams
---@return table Created project
function M.createProject(dbal, params)
  return dbal:create('CodegenProject', {
    tenantId = params.tenantId,
    name = params.name,
    description = params.description,
    framework = params.framework,
    settings = params.settings and json.encode(params.settings) or '{}',
    status = 'active',
    createdBy = params.createdBy,
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---Get project by ID
---@param dbal table
---@param projectId string
---@return table|nil Project
function M.getProject(dbal, projectId)
  local project = dbal:read('CodegenProject', projectId)
  if project and project.settings then
    project.settings = json.decode(project.settings)
  end
  return project
end

---List projects
---@param dbal table
---@param tenantId string
---@param framework string|nil Filter by framework
---@param take number|nil
---@param skip number|nil
---@return table List result
function M.listProjects(dbal, tenantId, framework, take, skip)
  local where = { tenantId = tenantId, status = 'active' }
  
  if framework then
    where.framework = framework
  end
  
  return dbal:list('CodegenProject', {
    where = where,
    orderBy = { updatedAt = 'desc' },
    take = take or 20,
    skip = skip or 0,
  })
end

---Update project
---@param dbal table
---@param projectId string
---@param updates table
---@return table Updated project
function M.updateProject(dbal, projectId, updates)
  if updates.settings and type(updates.settings) == 'table' then
    updates.settings = json.encode(updates.settings)
  end
  updates.updatedAt = os.time() * 1000
  return dbal:update('CodegenProject', projectId, updates)
end

---Archive project
---@param dbal table
---@param projectId string
function M.archiveProject(dbal, projectId)
  return M.updateProject(dbal, projectId, { status = 'archived' })
end

---Delete project
---@param dbal table
---@param projectId string
---@return boolean Success
function M.deleteProject(dbal, projectId)
  return dbal:delete('CodegenProject', projectId)
end

---------------------------------------------------------------------------
-- BLUEPRINT OPERATIONS
---------------------------------------------------------------------------

---@class CodegenBlueprintCreateParams
---@field tenantId string
---@field projectId string
---@field name string
---@field type string component|page|api|model|etc
---@field spec table Blueprint specification
---@field createdBy string

---Create a new blueprint
---@param dbal table
---@param params CodegenBlueprintCreateParams
---@return table Created blueprint
function M.createBlueprint(dbal, params)
  return dbal:create('CodegenBlueprint', {
    tenantId = params.tenantId,
    projectId = params.projectId,
    name = params.name,
    type = params.type,
    spec = json.encode(params.spec or {}),
    version = 1,
    status = 'draft',
    createdBy = params.createdBy,
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---Get blueprint by ID
---@param dbal table
---@param blueprintId string
---@return table|nil Blueprint
function M.getBlueprint(dbal, blueprintId)
  local blueprint = dbal:read('CodegenBlueprint', blueprintId)
  if blueprint and blueprint.spec then
    blueprint.spec = json.decode(blueprint.spec)
  end
  return blueprint
end

---List blueprints for a project
---@param dbal table
---@param projectId string
---@param type string|nil Filter by type
---@param take number|nil
---@return table List result
function M.listBlueprints(dbal, projectId, type, take)
  local where = { projectId = projectId }
  
  if type then
    where.type = type
  end
  
  return dbal:list('CodegenBlueprint', {
    where = where,
    orderBy = { name = 'asc' },
    take = take or 50,
  })
end

---Update blueprint spec
---@param dbal table
---@param blueprintId string
---@param spec table
---@return table Updated blueprint
function M.updateBlueprintSpec(dbal, blueprintId, spec)
  local blueprint = M.getBlueprint(dbal, blueprintId)
  if not blueprint then
    error('Blueprint not found: ' .. blueprintId)
  end
  
  return dbal:update('CodegenBlueprint', blueprintId, {
    spec = json.encode(spec),
    version = (blueprint.version or 0) + 1,
    updatedAt = os.time() * 1000,
  })
end

---Publish blueprint
---@param dbal table
---@param blueprintId string
function M.publishBlueprint(dbal, blueprintId)
  return dbal:update('CodegenBlueprint', blueprintId, {
    status = 'published',
    publishedAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---Delete blueprint
---@param dbal table
---@param blueprintId string
---@return boolean Success
function M.deleteBlueprint(dbal, blueprintId)
  return dbal:delete('CodegenBlueprint', blueprintId)
end

---------------------------------------------------------------------------
-- TEMPLATE OPERATIONS
---------------------------------------------------------------------------

---@class CodegenTemplateCreateParams
---@field tenantId string
---@field name string
---@field type string component|page|api|model|hook|etc
---@field framework string
---@field content string Template content with placeholders
---@field variables table[] Variable definitions
---@field isPublic boolean|nil

---Create a new template
---@param dbal table
---@param params CodegenTemplateCreateParams
---@return table Created template
function M.createTemplate(dbal, params)
  return dbal:create('CodegenTemplate', {
    tenantId = params.tenantId,
    name = params.name,
    type = params.type,
    framework = params.framework,
    content = params.content,
    variables = json.encode(params.variables or {}),
    isPublic = params.isPublic or false,
    usageCount = 0,
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---Get template by ID
---@param dbal table
---@param templateId string
---@return table|nil Template
function M.getTemplate(dbal, templateId)
  local template = dbal:read('CodegenTemplate', templateId)
  if template and template.variables then
    template.variables = json.decode(template.variables)
  end
  return template
end

---List templates
---@param dbal table
---@param tenantId string
---@param framework string|nil
---@param type string|nil
---@param take number|nil
---@return table[] Templates
function M.listTemplates(dbal, tenantId, framework, type, take)
  -- Get tenant templates
  local where = { tenantId = tenantId }
  
  local result = dbal:list('CodegenTemplate', {
    where = where,
    orderBy = { usageCount = 'desc' },
    take = take or 50,
  })
  
  local templates = result.items or {}
  
  -- Filter by framework and type
  if framework or type then
    local filtered = {}
    for _, t in ipairs(templates) do
      local matchFramework = not framework or t.framework == framework
      local matchType = not type or t.type == type
      if matchFramework and matchType then
        table.insert(filtered, t)
      end
    end
    templates = filtered
  end
  
  -- Parse variables
  for _, t in ipairs(templates) do
    if t.variables and type(t.variables) == 'string' then
      t.variables = json.decode(t.variables)
    end
  end
  
  return templates
end

---Update template
---@param dbal table
---@param templateId string
---@param updates table
---@return table Updated template
function M.updateTemplate(dbal, templateId, updates)
  if updates.variables and type(updates.variables) == 'table' then
    updates.variables = json.encode(updates.variables)
  end
  updates.updatedAt = os.time() * 1000
  return dbal:update('CodegenTemplate', templateId, updates)
end

---Increment template usage
---@param dbal table
---@param templateId string
function M.incrementUsage(dbal, templateId)
  local template = M.getTemplate(dbal, templateId)
  if template then
    dbal:update('CodegenTemplate', templateId, {
      usageCount = (template.usageCount or 0) + 1,
    })
  end
end

---Delete template
---@param dbal table
---@param templateId string
---@return boolean Success
function M.deleteTemplate(dbal, templateId)
  return dbal:delete('CodegenTemplate', templateId)
end

---------------------------------------------------------------------------
-- GENERATION OPERATIONS
---------------------------------------------------------------------------

---Generate code from template
---@param dbal table
---@param templateId string
---@param variables table Variable values
---@return string Generated code
function M.generateFromTemplate(dbal, templateId, variables)
  local template = M.getTemplate(dbal, templateId)
  if not template then
    error('Template not found: ' .. templateId)
  end
  
  M.incrementUsage(dbal, templateId)
  
  local code = template.content
  
  -- Replace variables
  for key, value in pairs(variables) do
    code = code:gsub('{{' .. key .. '}}', tostring(value))
    code = code:gsub('{%% ' .. key .. ' %%}', tostring(value))
  end
  
  return code
end

---Log a generation event
---@param dbal table
---@param tenantId string
---@param projectId string
---@param templateId string|nil
---@param blueprintId string|nil
---@param output table Generated files
---@param userId string
function M.logGeneration(dbal, tenantId, projectId, templateId, blueprintId, output, userId)
  return dbal:create('CodegenHistory', {
    tenantId = tenantId,
    projectId = projectId,
    templateId = templateId,
    blueprintId = blueprintId,
    output = json.encode(output),
    generatedBy = userId,
    generatedAt = os.time() * 1000,
  })
end

return M
