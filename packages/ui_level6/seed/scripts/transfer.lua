-- Power transfer utilities for supergod
local M = {}

function M.transfer_form(from_user, to_user)
  return {
    type = "power_transfer_form",
    fromUser = from_user,
    toUser = to_user,
    confirmationRequired = true,
    warningMessage = "This action transfers all supergod privileges and cannot be undone."
  }
end

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
