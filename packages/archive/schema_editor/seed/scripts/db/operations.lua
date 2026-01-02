-- schema_editor/seed/scripts/db/operations.lua
-- DBAL operations for Schema Registry entities
-- @module schema_editor.db.operations

local M = {}
local json = require('json')

---------------------------------------------------------------------------
-- ENTITY SCHEMA OPERATIONS
---------------------------------------------------------------------------

---@class EntitySchemaParams
---@field tenantId string
---@field name string Entity name
---@field fields table[] Field definitions
---@field indexes table[]|nil Index definitions
---@field relations table[]|nil Relation definitions
---@field acl table|nil Access control rules

---Create or update entity schema
---@param dbal table DBAL client instance
---@param params EntitySchemaParams
---@return table Created/updated schema
function M.saveEntitySchema(dbal, params)
  local existing = dbal:findFirst('EntitySchema', {
    where = { tenantId = params.tenantId, name = params.name },
  })
  
  local data = {
    fields = json.encode(params.fields),
    indexes = params.indexes and json.encode(params.indexes) or nil,
    relations = params.relations and json.encode(params.relations) or nil,
    acl = params.acl and json.encode(params.acl) or nil,
    updatedAt = os.time() * 1000,
  }
  
  if existing then
    data.version = (existing.version or 1) + 1
    return dbal:update('EntitySchema', existing.id, data)
  end
  
  data.tenantId = params.tenantId
  data.name = params.name
  data.version = 1
  data.createdAt = os.time() * 1000
  return dbal:create('EntitySchema', data)
end

---Get entity schema by name
---@param dbal table
---@param tenantId string
---@param name string
---@return table|nil Schema with decoded fields
function M.getEntitySchema(dbal, tenantId, name)
  local schema = dbal:findFirst('EntitySchema', {
    where = { tenantId = tenantId, name = name },
  })
  
  if schema then
    schema.fields = json.decode(schema.fields or '[]')
    schema.indexes = schema.indexes and json.decode(schema.indexes) or {}
    schema.relations = schema.relations and json.decode(schema.relations) or {}
    schema.acl = schema.acl and json.decode(schema.acl) or nil
  end
  
  return schema
end

---List all entity schemas
---@param dbal table
---@param tenantId string
---@return table[] Schemas
function M.listEntitySchemas(dbal, tenantId)
  local result = dbal:list('EntitySchema', {
    where = { tenantId = tenantId },
    orderBy = { name = 'asc' },
    take = 200,
  })
  
  return result.items or {}
end

---Delete entity schema
---@param dbal table
---@param tenantId string
---@param name string
function M.deleteEntitySchema(dbal, tenantId, name)
  local schema = M.getEntitySchema(dbal, tenantId, name)
  if schema then
    return dbal:delete('EntitySchema', schema.id)
  end
  return false
end

---------------------------------------------------------------------------
-- FIELD OPERATIONS
---------------------------------------------------------------------------

---@class FieldDefinition
---@field name string
---@field type string (String, Int, Float, Boolean, DateTime, Json, etc.)
---@field required boolean|nil
---@field unique boolean|nil
---@field default any|nil
---@field validation table|nil

---Add field to entity schema
---@param dbal table
---@param tenantId string
---@param entityName string
---@param field FieldDefinition
---@return table Updated schema
function M.addField(dbal, tenantId, entityName, field)
  local schema = M.getEntitySchema(dbal, tenantId, entityName)
  if not schema then
    error('Entity schema not found: ' .. entityName)
  end
  
  local fields = schema.fields or {}
  
  -- Check for duplicate field name
  for _, f in ipairs(fields) do
    if f.name == field.name then
      error('Field already exists: ' .. field.name)
    end
  end
  
  table.insert(fields, field)
  
  return M.saveEntitySchema(dbal, {
    tenantId = tenantId,
    name = entityName,
    fields = fields,
    indexes = schema.indexes,
    relations = schema.relations,
    acl = schema.acl,
  })
end

---Update field definition
---@param dbal table
---@param tenantId string
---@param entityName string
---@param fieldName string
---@param updates table
---@return table Updated schema
function M.updateField(dbal, tenantId, entityName, fieldName, updates)
  local schema = M.getEntitySchema(dbal, tenantId, entityName)
  if not schema then
    error('Entity schema not found: ' .. entityName)
  end
  
  local fields = schema.fields or {}
  local found = false
  
  for i, field in ipairs(fields) do
    if field.name == fieldName then
      for key, value in pairs(updates) do
        fields[i][key] = value
      end
      found = true
      break
    end
  end
  
  if not found then
    error('Field not found: ' .. fieldName)
  end
  
  return M.saveEntitySchema(dbal, {
    tenantId = tenantId,
    name = entityName,
    fields = fields,
    indexes = schema.indexes,
    relations = schema.relations,
    acl = schema.acl,
  })
end

---Remove field from entity
---@param dbal table
---@param tenantId string
---@param entityName string
---@param fieldName string
---@return table Updated schema
function M.removeField(dbal, tenantId, entityName, fieldName)
  local schema = M.getEntitySchema(dbal, tenantId, entityName)
  if not schema then
    error('Entity schema not found: ' .. entityName)
  end
  
  local fields = schema.fields or {}
  local newFields = {}
  
  for _, field in ipairs(fields) do
    if field.name ~= fieldName then
      table.insert(newFields, field)
    end
  end
  
  return M.saveEntitySchema(dbal, {
    tenantId = tenantId,
    name = entityName,
    fields = newFields,
    indexes = schema.indexes,
    relations = schema.relations,
    acl = schema.acl,
  })
end

---------------------------------------------------------------------------
-- INDEX OPERATIONS
---------------------------------------------------------------------------

---@class IndexDefinition
---@field name string
---@field fields table[] Field names
---@field unique boolean|nil

---Add index to entity
---@param dbal table
---@param tenantId string
---@param entityName string
---@param index IndexDefinition
---@return table Updated schema
function M.addIndex(dbal, tenantId, entityName, index)
  local schema = M.getEntitySchema(dbal, tenantId, entityName)
  if not schema then
    error('Entity schema not found: ' .. entityName)
  end
  
  local indexes = schema.indexes or {}
  table.insert(indexes, index)
  
  return M.saveEntitySchema(dbal, {
    tenantId = tenantId,
    name = entityName,
    fields = schema.fields,
    indexes = indexes,
    relations = schema.relations,
    acl = schema.acl,
  })
end

---Remove index from entity
---@param dbal table
---@param tenantId string
---@param entityName string
---@param indexName string
---@return table Updated schema
function M.removeIndex(dbal, tenantId, entityName, indexName)
  local schema = M.getEntitySchema(dbal, tenantId, entityName)
  if not schema then
    error('Entity schema not found: ' .. entityName)
  end
  
  local indexes = schema.indexes or {}
  local newIndexes = {}
  
  for _, idx in ipairs(indexes) do
    if idx.name ~= indexName then
      table.insert(newIndexes, idx)
    end
  end
  
  return M.saveEntitySchema(dbal, {
    tenantId = tenantId,
    name = entityName,
    fields = schema.fields,
    indexes = newIndexes,
    relations = schema.relations,
    acl = schema.acl,
  })
end

---------------------------------------------------------------------------
-- RELATION OPERATIONS
---------------------------------------------------------------------------

---@class RelationDefinition
---@field name string
---@field type string (hasOne, hasMany, belongsTo, manyToMany)
---@field target string Target entity name
---@field foreignKey string|nil
---@field through string|nil For manyToMany

---Add relation to entity
---@param dbal table
---@param tenantId string
---@param entityName string
---@param relation RelationDefinition
---@return table Updated schema
function M.addRelation(dbal, tenantId, entityName, relation)
  local schema = M.getEntitySchema(dbal, tenantId, entityName)
  if not schema then
    error('Entity schema not found: ' .. entityName)
  end
  
  local relations = schema.relations or {}
  table.insert(relations, relation)
  
  return M.saveEntitySchema(dbal, {
    tenantId = tenantId,
    name = entityName,
    fields = schema.fields,
    indexes = schema.indexes,
    relations = relations,
    acl = schema.acl,
  })
end

---Remove relation from entity
---@param dbal table
---@param tenantId string
---@param entityName string
---@param relationName string
---@return table Updated schema
function M.removeRelation(dbal, tenantId, entityName, relationName)
  local schema = M.getEntitySchema(dbal, tenantId, entityName)
  if not schema then
    error('Entity schema not found: ' .. entityName)
  end
  
  local relations = schema.relations or {}
  local newRelations = {}
  
  for _, rel in ipairs(relations) do
    if rel.name ~= relationName then
      table.insert(newRelations, rel)
    end
  end
  
  return M.saveEntitySchema(dbal, {
    tenantId = tenantId,
    name = entityName,
    fields = schema.fields,
    indexes = schema.indexes,
    relations = newRelations,
    acl = schema.acl,
  })
end

---------------------------------------------------------------------------
-- SCHEMA VALIDATION
---------------------------------------------------------------------------

---Validate entity schema
---@param dbal table
---@param tenantId string
---@param entityName string
---@return table Validation result
function M.validateSchema(dbal, tenantId, entityName)
  local schema = M.getEntitySchema(dbal, tenantId, entityName)
  if not schema then
    return { valid = false, errors = { 'Entity schema not found' } }
  end
  
  local errors = {}
  
  -- Validate fields
  for _, field in ipairs(schema.fields or {}) do
    if not field.name or field.name == '' then
      table.insert(errors, 'Field must have a name')
    end
    if not field.type or field.type == '' then
      table.insert(errors, 'Field must have a type: ' .. (field.name or 'unknown'))
    end
  end
  
  -- Validate indexes reference valid fields
  local fieldNames = {}
  for _, field in ipairs(schema.fields or {}) do
    fieldNames[field.name] = true
  end
  
  for _, idx in ipairs(schema.indexes or {}) do
    for _, fieldName in ipairs(idx.fields or {}) do
      if not fieldNames[fieldName] then
        table.insert(errors, 'Index references non-existent field: ' .. fieldName)
      end
    end
  end
  
  return {
    valid = #errors == 0,
    errors = errors,
  }
end

---------------------------------------------------------------------------
-- SCHEMA VERSION HISTORY
---------------------------------------------------------------------------

---Get schema version history
---@param dbal table
---@param tenantId string
---@param entityName string
---@return table[] Version history
function M.getVersionHistory(dbal, tenantId, entityName)
  local result = dbal:list('SchemaVersion', {
    where = { tenantId = tenantId, entityName = entityName },
    orderBy = { version = 'desc' },
    take = 50,
  })
  
  return result.items or {}
end

---Save schema version snapshot
---@param dbal table
---@param tenantId string
---@param entityName string
---@param schema table Current schema
---@param changeNote string|nil
function M.saveVersion(dbal, tenantId, entityName, schema, changeNote)
  return dbal:create('SchemaVersion', {
    tenantId = tenantId,
    entityName = entityName,
    version = schema.version or 1,
    snapshot = json.encode(schema),
    changeNote = changeNote,
    createdAt = os.time() * 1000,
  })
end

return M
