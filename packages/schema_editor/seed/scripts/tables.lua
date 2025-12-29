-- Table management
local M = {}

function M.create(name, fields)
  return {
    action = "create_table",
    name = name,
    fields = fields or {}
  }
end

function M.render(table_def)
  return {
    type = "table_editor",
    props = {
      name = table_def.name,
      fields = table_def.fields
    }
  }
end

function M.add_field(table_name, field)
  return {
    action = "add_field",
    table = table_name,
    field = field
  }
end

function M.remove_field(table_name, field_name)
  return {
    action = "remove_field",
    table = table_name,
    field = field_name
  }
end

return M
