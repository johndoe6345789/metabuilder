-- Power transfer history component

---@class HistoryColumnDefinition
---@field id string
---@field label string
---@field type? string

---@class TransferHistoryComponent
---@field type string
---@field columns HistoryColumnDefinition[]

---Returns the transfer history component configuration
---@return TransferHistoryComponent
local function transfer_history()
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

return transfer_history
