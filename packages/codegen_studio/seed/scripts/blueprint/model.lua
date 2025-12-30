-- Codegen template model
local function model_template(name, fields)
  return {
    type = "model",
    name = name,
    fields = fields or {},
    template = "prisma"
  }
end

return model_template
