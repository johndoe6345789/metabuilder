-- Type definitions for power transfer module

---@class User
---@field id string
---@field name string

---@class TransferFormComponent
---@field type string
---@field fromUser User
---@field toUser User
---@field confirmationRequired boolean
---@field warningMessage string

---@class HistoryColumnDefinition
---@field id string
---@field label string
---@field type? string

---@class TransferHistoryComponent
---@field type string
---@field columns HistoryColumnDefinition[]

return {}
