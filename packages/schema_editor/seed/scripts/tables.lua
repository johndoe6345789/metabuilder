-- Table management

---@class CreateTableAction
---@field action "create_table"
---@field name string Table name
---@field fields FieldDefinition[] Array of field definitions

---@class AddFieldAction
---@field action "add_field"
---@field table string Table name
---@field field FieldDefinition Field to add

---@class RemoveFieldAction
---@field action "remove_field"
---@field table string Table name
---@field field string Field name to remove

---@class TableEditorProps
---@field name string Table name
---@field fields FieldDefinition[] Array of field definitions

---@class TableEditorComponent
---@field type "table_editor"
---@field props TableEditorProps

---@class TableDefinition
---@field name string Table name
---@field fields FieldDefinition[] Array of field definitions

---@class TablesModule
local M = {}

---Create a new table definition
---@param name string Table name
---@param fields? FieldDefinition[] Array of field definitions
---@return CreateTableAction
function M.create(name, fields)
  return {
    action = "create_table",
    name = name,
    fields = fields or {}
  }
end

---Render a table editor component
---@param table_def TableDefinition Table definition
---@return TableEditorComponent
function M.render(table_def)
  return {
    type = "table_editor",
    props = {
      name = table_def.name,
      fields = table_def.fields
    }
  }
end

---Create an add field action
---@param table_name string Table name
---@param field FieldDefinition Field to add
---@return AddFieldAction
function M.add_field(table_name, field)
  return {
    action = "add_field",
    table = table_name,
    field = field
  }
end

---Create a remove field action
---@param table_name string Table name
---@param field_name string Field name to remove
---@return RemoveFieldAction
function M.remove_field(table_name, field_name)
  return {
    action = "remove_field",
    table = table_name,
    field = field_name
  }
end

return M
