-- Transfer Tests for ui_level6
-- Parameterized tests for supergod-level transfer functions

local describe = require("lua_test.describe")
local it = require("lua_test.it")
local it_each = require("lua_test.it_each")
local expect = require("lua_test.expect")

local cases = require("tests.transfer.cases")
local transferForm = require("transfer.transfer_form")
local transferHistory = require("transfer.transfer_history")

describe("transfer (level6)", function()

  describe("transferForm", function()
    it_each(cases.transferForm.valid, "$description", function(case)
      local fromUser = { id = case.fromId, name = case.fromName }
      local toUser = { id = case.toId, name = case.toName }
      local form = transferForm(fromUser, toUser)
      
      expect(form.type).toBe("power_transfer_form")
      expect(form.fromUser.id).toBe(case.fromId)
      expect(form.toUser.id).toBe(case.toId)
      expect(form.confirmationRequired).toBe(true)
      expect(form.warningMessage).toBeTruthy()
    end)

    it("should require confirmation", function()
      local fromUser = { id = "supergod_1", name = "SuperGod" }
      local toUser = { id = "new_god", name = "NewGod" }
      local form = transferForm(fromUser, toUser)
      expect(form.confirmationRequired).toBe(true)
    end)

    it("should include warning message", function()
      local fromUser = { id = "supergod_1", name = "SuperGod" }
      local toUser = { id = "new_god", name = "NewGod" }
      local form = transferForm(fromUser, toUser)
      expect(form.warningMessage).toContain("cannot be undone")
    end)
  end)

  describe("transferHistory", function()
    it("should return history component configuration", function()
      local history = transferHistory()
      expect(history.type).toBe("transfer_history")
      expect(history.columns).toBeTruthy()
    end)

    it_each(cases.transferHistory.columns, "should have $label column", function(case)
      local history = transferHistory()
      local found = false
      for _, col in ipairs(history.columns) do
        if col.id == case.id then
          expect(col.label).toBe(case.label)
          if case.type then
            expect(col.type).toBe(case.type)
          end
          found = true
          break
        end
      end
      expect(found).toBe(true)
    end)

    it("should have all required columns", function()
      local history = transferHistory()
      expect(#history.columns).toBeGreaterThanOrEqual(4)
    end)
  end)

end)

return {
  name = "transfer.test",
  description = "Tests for supergod transfer functions"
}
