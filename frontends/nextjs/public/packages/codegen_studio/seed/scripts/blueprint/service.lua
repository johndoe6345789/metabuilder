-- Codegen template service

---@class ServiceTemplate
---@field type string
---@field name string
---@field methods table
---@field template string

---@param name string The name of the service
---@param methods? table Optional service methods
---@return ServiceTemplate
local function service_template(name, methods)
  return {
    type = "service",
    name = name,
    methods = methods or {},
    template = "typescript"
  }
end

return service_template
