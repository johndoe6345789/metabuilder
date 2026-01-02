-- Codegen template model

---@class ModelTemplate
---@field type string
---@field name string
---@field fields table
---@field template string

---@param name string The name of the model
---@param fields? table Optional model fields
---@return ModelTemplate
local function model_template(name, fields)
  return {
    type = "model",
    name = name,
    fields = fields or {},
    template = "prisma"
  }
end

return model_template
