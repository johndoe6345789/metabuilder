-- Power transfer form component

---@class User
---@field id string
---@field name string

---@class TransferFormComponent
---@field type string
---@field fromUser User
---@field toUser User
---@field confirmationRequired boolean
---@field warningMessage string

---Returns the power transfer form configuration
---@param from_user User
---@param to_user User
---@return TransferFormComponent
local function transfer_form(from_user, to_user)
  return {
    type = "power_transfer_form",
    fromUser = from_user,
    toUser = to_user,
    confirmationRequired = true,
    warningMessage = "This action transfers all supergod privileges and cannot be undone."
  }
end

return transfer_form
