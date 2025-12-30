-- Table relationships

---@alias RelationType "one_to_one" | "one_to_many" | "many_to_many"

---@class RelationEndpoint
---@field table string Table name
---@field field string Field name

---@class RelationOptions
---@field cascade? boolean Whether to cascade deletes

---@class Relation
---@field type RelationType Relation type
---@field from_table string Source table name
---@field from_field string Source field name
---@field to_table string Target table name
---@field to_field string Target field name
---@field cascade boolean Whether to cascade deletes
---@field pivot_table? string Pivot table for many-to-many

---@class RelationsModule
---@field ONE_TO_ONE string
---@field ONE_TO_MANY string
---@field MANY_TO_MANY string
local M = {}

M.ONE_TO_ONE = "one_to_one"
M.ONE_TO_MANY = "one_to_many"
M.MANY_TO_MANY = "many_to_many"

---Define a table relationship
---@param type RelationType Relation type
---@param from RelationEndpoint Source endpoint
---@param to RelationEndpoint Target endpoint
---@param options? RelationOptions Relation options
---@return Relation
function M.define(type, from, to, options)
  return {
    type = type,
    from_table = from.table,
    from_field = from.field,
    to_table = to.table,
    to_field = to.field,
    cascade = options and options.cascade or false
  }
end

---Create a one-to-one relationship
---@param from RelationEndpoint Source endpoint
---@param to RelationEndpoint Target endpoint
---@return Relation
function M.has_one(from, to)
  return M.define(M.ONE_TO_ONE, from, to)
end

---Create a one-to-many relationship
---@param from RelationEndpoint Source endpoint
---@param to RelationEndpoint Target endpoint
---@return Relation
function M.has_many(from, to)
  return M.define(M.ONE_TO_MANY, from, to)
end

---Create a many-to-many relationship
---@param from RelationEndpoint Source endpoint
---@param to RelationEndpoint Target endpoint
---@param pivot string Pivot table name
---@return Relation
function M.belongs_to_many(from, to, pivot)
  local rel = M.define(M.MANY_TO_MANY, from, to)
  rel.pivot_table = pivot
  return rel
end

return M
