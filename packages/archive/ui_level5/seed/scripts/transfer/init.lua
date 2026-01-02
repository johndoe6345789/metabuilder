-- Transfer module facade
-- Re-exports all transfer functions for backward compatibility

local initiate = require("transfer.initiate_transfer")
local confirm = require("transfer.confirm_transfer")
local assign = require("transfer.assign_god")

---@class TransferModule
---@field initiateTransfer fun(ctx: TransferContext): TransferResult
---@field confirmTransfer fun(ctx: TransferContext): TransferResult
---@field assignGod fun(ctx: TransferContext): TransferResult
local M = {}

M.initiateTransfer = initiate.initiateTransfer
M.confirmTransfer = confirm.confirmTransfer
M.assignGod = assign.assignGod

return M
