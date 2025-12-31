-- Mock and spy utilities facade
-- Re-exports all mock modules for backward compatibility
--
-- Split into focused modules:
--   mock_fn.lua      - Mock function creator (fn)
--   spy.lua          - Method spying (spyOn)
--   mock_object.lua  - Mock object creator (mockObject)
--   fake_timers.lua  - Timer mocks (useFakeTimers)

local mock_fn = require("mock_fn")
local spy = require("spy")
local mock_object = require("mock_object")
local fake_timers = require("fake_timers")

---@class MocksModule
local M = {}

-- Re-export mock function
M.fn = mock_fn.fn

-- Re-export spy
M.spyOn = spy.spyOn

-- Re-export mock object
M.mockObject = mock_object.mockObject

-- Re-export fake timers
M.useFakeTimers = fake_timers.useFakeTimers

return M
