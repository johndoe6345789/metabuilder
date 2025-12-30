--- Steps editor logic facade for quick guides
--- Re-exports step functions for backward compatibility
---@module steps

local generate_step_id = require("generate_step_id")
local create_step = require("create_step")
local update_step = require("update_step")
local remove_step = require("remove_step")
local add_step = require("add_step")
local reset_ordering = require("reset_ordering")
local validate_step = require("validate_step")
local validate_all_steps = require("validate_all_steps")

---@class StepsModule
local M = {}

M.generateStepId = generate_step_id
M.createStep = create_step
M.updateStep = update_step
M.removeStep = remove_step
M.addStep = add_step
M.resetOrdering = reset_ordering
M.validateStep = validate_step
M.validateAllSteps = validate_all_steps

return M
