-- Tests for user_manager actions.lua module
-- Loads test cases from JSON file

local cases = load_cases("actions.cases.json")

describe("user_manager/actions", function()
  local actions
  
  beforeEach(function()
    actions = {
      create = function(data)
        return { action = "create_user", data = data }
      end,
      
      update = function(user_id, data)
        return { action = "update_user", user_id = user_id, data = data }
      end,
      
      delete = function(user_id)
        return { action = "delete_user", user_id = user_id, confirm = true }
      end,
      
      change_level = function(user_id, new_level)
        return { action = "change_level", user_id = user_id, level = new_level }
      end,
      
      toggle_active = function(user_id, active)
        return { action = "toggle_active", user_id = user_id, active = active }
      end
    }
  end)
  
  describe("create", function()
    it_each(cases.create)("should create user with $desc", function(tc)
      local result = actions.create(tc.data)
      expect(result.action).toBe("create_user")
      expect(result.data).toEqual(tc.data)
    end)
  end)
  
  describe("update", function()
    it_each(cases.update)("should $desc", function(tc)
      local result = actions.update(tc.user_id, tc.data)
      expect(result.action).toBe("update_user")
      expect(result.user_id).toBe(tc.user_id)
      expect(result.data).toEqual(tc.data)
    end)
  end)
  
  describe("delete", function()
    it_each(cases.delete)("should delete user $user_id with confirmation", function(tc)
      local result = actions.delete(tc.user_id)
      expect(result.action).toBe("delete_user")
      expect(result.user_id).toBe(tc.user_id)
      expect(result.confirm).toBe(true)
    end)
  end)
  
  describe("change_level", function()
    it_each(cases.change_level)("should change $user_id $desc", function(tc)
      local result = actions.change_level(tc.user_id, tc.level)
      expect(result.action).toBe("change_level")
      expect(result.user_id).toBe(tc.user_id)
      expect(result.level).toBe(tc.level)
    end)
  end)
  
  describe("toggle_active", function()
    it_each(cases.toggle_active)("should $desc $user_id", function(tc)
      local result = actions.toggle_active(tc.user_id, tc.active)
      expect(result.action).toBe("toggle_active")
      expect(result.user_id).toBe(tc.user_id)
      expect(result.active).toBe(tc.active)
    end)
  end)
end)
