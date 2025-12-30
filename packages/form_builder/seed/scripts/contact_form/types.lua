-- Type definitions for contact form

---@class FormField
---@field name string
---@field label string
---@field type string
---@field required? boolean

---@class FormConfig
---@field fields FormField[]
---@field successMessage string

---@class FormState
---@field [string] string

---@class FormValidation
---@field valid boolean
---@field errors table<string, string>

---@class SubmitResult
---@field success boolean
---@field message? string
---@field errors? table<string, string>
---@field data? FormState

return {}
