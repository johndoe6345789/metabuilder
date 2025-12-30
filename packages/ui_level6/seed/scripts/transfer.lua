-- Power transfer utilities for supergod

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

local M = {}

---@param from_user User
---@param to_user User
---@return TransferFormComponent
function M.transfer_form(from_user, to_user)
  return {
    type = "power_transfer_form",
    fromUser = from_user,
    toUser = to_user,
    confirmationRequired = true,
    warningMessage = "This action transfers all supergod privileges and cannot be undone."
  }
end

---@return TransferHistoryComponent
function M.transfer_history()
  return {
    type = "transfer_history",
    columns = {
      { id = "date", label = "Date", type = "date" },
      { id = "from", label = "From User" },
      { id = "to", label = "To User" },
      { id = "reason", label = "Reason" }
    }
  }
end

return M
