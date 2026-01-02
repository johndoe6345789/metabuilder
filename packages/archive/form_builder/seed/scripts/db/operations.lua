-- form_builder/seed/scripts/db/operations.lua
-- DBAL operations for Form and Submission entities
-- @module form_builder.db.operations

local M = {}
local json = require('json')

---------------------------------------------------------------------------
-- FORM OPERATIONS
---------------------------------------------------------------------------

---@class FormCreateParams
---@field tenantId string
---@field name string
---@field description string|nil
---@field fields table[] Form field definitions
---@field settings table|nil Form settings
---@field validationRules table|nil Validation rules

---Create a new form
---@param dbal table DBAL client instance
---@param params FormCreateParams
---@return table Created form
function M.createForm(dbal, params)
  return dbal:create('Form', {
    tenantId = params.tenantId,
    name = params.name,
    description = params.description,
    fields = json.encode(params.fields),
    settings = params.settings and json.encode(params.settings) or '{}',
    validationRules = params.validationRules and json.encode(params.validationRules) or nil,
    isActive = true,
    version = 1,
    submissionCount = 0,
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---Get form by ID
---@param dbal table
---@param formId string
---@return table|nil Form with decoded fields
function M.getForm(dbal, formId)
  local form = dbal:read('Form', formId)
  if form then
    form.fields = json.decode(form.fields or '[]')
    form.settings = json.decode(form.settings or '{}')
    if form.validationRules then
      form.validationRules = json.decode(form.validationRules)
    end
  end
  return form
end

---List forms for tenant
---@param dbal table
---@param tenantId string
---@param activeOnly boolean|nil
---@return table[] Forms
function M.listForms(dbal, tenantId, activeOnly)
  local where = { tenantId = tenantId }
  if activeOnly then
    where.isActive = true
  end
  
  local result = dbal:list('Form', {
    where = where,
    orderBy = { createdAt = 'desc' },
    take = 100,
  })
  
  return result.items or {}
end

---Update form definition
---@param dbal table
---@param formId string
---@param updates table
---@return table Updated form
function M.updateForm(dbal, formId, updates)
  -- Encode complex fields
  if updates.fields and type(updates.fields) == 'table' then
    updates.fields = json.encode(updates.fields)
  end
  if updates.settings and type(updates.settings) == 'table' then
    updates.settings = json.encode(updates.settings)
  end
  if updates.validationRules and type(updates.validationRules) == 'table' then
    updates.validationRules = json.encode(updates.validationRules)
  end
  
  -- Increment version on field changes
  if updates.fields then
    local form = M.getForm(dbal, formId)
    if form then
      updates.version = (form.version or 1) + 1
    end
  end
  
  updates.updatedAt = os.time() * 1000
  return dbal:update('Form', formId, updates)
end

---Clone form
---@param dbal table
---@param formId string
---@param newName string
---@return table Cloned form
function M.cloneForm(dbal, formId, newName)
  local original = M.getForm(dbal, formId)
  if not original then
    error('Form not found: ' .. formId)
  end
  
  return M.createForm(dbal, {
    tenantId = original.tenantId,
    name = newName,
    description = original.description,
    fields = original.fields, -- Already decoded
    settings = original.settings, -- Already decoded
    validationRules = original.validationRules,
  })
end

---Delete form
---@param dbal table
---@param formId string
---@return boolean
function M.deleteForm(dbal, formId)
  return dbal:delete('Form', formId)
end

---------------------------------------------------------------------------
-- FORM FIELD OPERATIONS
---------------------------------------------------------------------------

---@class FormField
---@field id string Unique field ID
---@field type string Field type (text, select, checkbox, etc.)
---@field name string Field name/key
---@field label string Display label
---@field required boolean
---@field options table|nil For select/radio fields
---@field validation table|nil Validation config
---@field order number Display order

---Add field to form
---@param dbal table
---@param formId string
---@param field FormField
---@return table Updated form
function M.addField(dbal, formId, field)
  local form = M.getForm(dbal, formId)
  if not form then
    error('Form not found: ' .. formId)
  end
  
  local fields = form.fields or {}
  
  -- Generate ID if not provided
  if not field.id then
    field.id = 'field_' .. os.time() .. '_' .. math.random(1000, 9999)
  end
  
  -- Set order to end if not specified
  if not field.order then
    field.order = #fields + 1
  end
  
  table.insert(fields, field)
  
  return M.updateForm(dbal, formId, { fields = fields })
end

---Update field in form
---@param dbal table
---@param formId string
---@param fieldId string
---@param updates table
---@return table Updated form
function M.updateField(dbal, formId, fieldId, updates)
  local form = M.getForm(dbal, formId)
  if not form then
    error('Form not found: ' .. formId)
  end
  
  local fields = form.fields or {}
  
  for i, field in ipairs(fields) do
    if field.id == fieldId then
      for key, value in pairs(updates) do
        fields[i][key] = value
      end
      break
    end
  end
  
  return M.updateForm(dbal, formId, { fields = fields })
end

---Remove field from form
---@param dbal table
---@param formId string
---@param fieldId string
---@return table Updated form
function M.removeField(dbal, formId, fieldId)
  local form = M.getForm(dbal, formId)
  if not form then
    error('Form not found: ' .. formId)
  end
  
  local fields = form.fields or {}
  local newFields = {}
  
  for _, field in ipairs(fields) do
    if field.id ~= fieldId then
      table.insert(newFields, field)
    end
  end
  
  return M.updateForm(dbal, formId, { fields = newFields })
end

---Reorder fields
---@param dbal table
---@param formId string
---@param fieldIds table[] Ordered array of field IDs
---@return table Updated form
function M.reorderFields(dbal, formId, fieldIds)
  local form = M.getForm(dbal, formId)
  if not form then
    error('Form not found: ' .. formId)
  end
  
  local fieldMap = {}
  for _, field in ipairs(form.fields or {}) do
    fieldMap[field.id] = field
  end
  
  local orderedFields = {}
  for order, fieldId in ipairs(fieldIds) do
    local field = fieldMap[fieldId]
    if field then
      field.order = order
      table.insert(orderedFields, field)
    end
  end
  
  return M.updateForm(dbal, formId, { fields = orderedFields })
end

---------------------------------------------------------------------------
-- SUBMISSION OPERATIONS
---------------------------------------------------------------------------

---@class SubmissionParams
---@field tenantId string
---@field formId string
---@field userId string|nil Submitter user ID
---@field data table Form data
---@field metadata table|nil Additional metadata

---Submit form response
---@param dbal table
---@param params SubmissionParams
---@return table Created submission
function M.submitForm(dbal, params)
  -- Increment form submission count
  local form = dbal:read('Form', params.formId)
  if form then
    dbal:update('Form', params.formId, {
      submissionCount = (form.submissionCount or 0) + 1,
    })
  end
  
  return dbal:create('FormSubmission', {
    tenantId = params.tenantId,
    formId = params.formId,
    userId = params.userId,
    data = json.encode(params.data),
    metadata = params.metadata and json.encode(params.metadata) or nil,
    status = 'submitted',
    submittedAt = os.time() * 1000,
  })
end

---Get submission by ID
---@param dbal table
---@param submissionId string
---@return table|nil Submission
function M.getSubmission(dbal, submissionId)
  local sub = dbal:read('FormSubmission', submissionId)
  if sub then
    sub.data = json.decode(sub.data or '{}')
    if sub.metadata then
      sub.metadata = json.decode(sub.metadata)
    end
  end
  return sub
end

---List submissions for a form
---@param dbal table
---@param formId string
---@param options table|nil Filtering options
---@return table List result
function M.listSubmissions(dbal, formId, options)
  options = options or {}
  
  local result = dbal:list('FormSubmission', {
    where = { formId = formId },
    orderBy = { submittedAt = 'desc' },
    take = options.take or 50,
    skip = options.skip or 0,
  })
  
  return {
    items = result.items or {},
    total = result.total or 0,
  }
end

---Update submission status
---@param dbal table
---@param submissionId string
---@param status string (submitted, reviewed, approved, rejected)
---@param reviewNotes string|nil
function M.updateSubmissionStatus(dbal, submissionId, status, reviewNotes)
  return dbal:update('FormSubmission', submissionId, {
    status = status,
    reviewNotes = reviewNotes,
    reviewedAt = os.time() * 1000,
  })
end

---Delete submission
---@param dbal table
---@param submissionId string
function M.deleteSubmission(dbal, submissionId)
  return dbal:delete('FormSubmission', submissionId)
end

---Export submissions as table
---@param dbal table
---@param formId string
---@return table[] Array of submission data objects
function M.exportSubmissions(dbal, formId)
  local result = dbal:list('FormSubmission', {
    where = { formId = formId },
    orderBy = { submittedAt = 'asc' },
    take = 10000,
  })
  
  local exports = {}
  for _, sub in ipairs(result.items or {}) do
    local data = json.decode(sub.data or '{}')
    data._submissionId = sub.id
    data._submittedAt = sub.submittedAt
    data._userId = sub.userId
    data._status = sub.status
    table.insert(exports, data)
  end
  
  return exports
end

return M
