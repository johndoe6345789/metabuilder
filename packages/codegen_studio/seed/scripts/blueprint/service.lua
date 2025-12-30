-- Codegen template service
local function service_template(name, methods)
  return {
    type = "service",
    name = name,
    methods = methods or {},
    template = "typescript"
  }
end

return service_template
