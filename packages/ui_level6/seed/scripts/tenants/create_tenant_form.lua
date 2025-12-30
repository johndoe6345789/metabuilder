-- Create tenant form component

---@class FormField
---@field id string
---@field type string
---@field label string
---@field required? boolean
---@field options? string[]

---@class FormComponent
---@field type string
---@field id string
---@field fields FormField[]

---Returns the create tenant form configuration
---@return FormComponent
local function create_tenant_form()
  return {
    type = "form",
    id = "create_tenant",
    fields = {
      { id = "name", type = "text", label = "Tenant Name", required = true },
      { id = "owner", type = "user_select", label = "Owner", required = true },
      { id = "plan", type = "select", label = "Plan", options = { "free", "pro", "enterprise" } }
    }
  }
end

return create_tenant_form
