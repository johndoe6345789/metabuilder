-- Type definitions for SMTP configuration

---@class SMTPConfig
---@field host string
---@field port number
---@field username string
---@field password string
---@field fromEmail string
---@field fromName string
---@field secure boolean

---@class SMTPField
---@field name string
---@field label string
---@field type "text"|"number"|"email"|"password"|"boolean"
---@field placeholder? string
---@field required boolean

---@class SMTPConfigData
---@field defaults SMTPConfig
---@field fields SMTPField[]

---@class SMTPEditorProps
---@field config? SMTPConfig
---@field testEmail? string

---@class ValidationResult
---@field valid boolean
---@field errors table<string, string>

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]
