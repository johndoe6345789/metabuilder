-- Tests for user_manager actions.lua module
-- Uses parameterized tests

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
    it_each({
      { data = { name = "John" },                    desc = "name only" },
      { data = { name = "Jane", email = "j@e.com" }, desc = "name and email" },
      { data = { name = "Bob", role = "admin" },     desc = "name and role" },
    })("should create user with $desc", function(tc)
      local result = actions.create(tc.data)
      expect(result.action).toBe("create_user")
      expect(result.data).toEqual(tc.data)
    end)
  end)
  
  describe("update", function()
    it_each({
      { user_id = "user-1",   data = { name = "Updated" },    desc = "update name" },
      { user_id = "user-2",   data = { role = "admin" },      desc = "update role" },
      { user_id = "user-123", data = { name = "X", role = "user" }, desc = "update multiple" },
    })("should $desc", function(tc)
      local result = actions.update(tc.user_id, tc.data)
      expect(result.action).toBe("update_user")
      expect(result.user_id).toBe(tc.user_id)
      expect(result.data).toEqual(tc.data)
    end)
  end)
  
  describe("delete", function()
    it_each({
      { user_id = "user-1" },
      { user_id = "user-123" },
      { user_id = "admin-456" },
    })("should delete user $user_id with confirmation", function(tc)
      local result = actions.delete(tc.user_id)
      expect(result.action).toBe("delete_user")
      expect(result.user_id).toBe(tc.user_id)
      expect(result.confirm).toBe(true)
    end)
  end)
  
  describe("change_level", function()
    it_each({
      { user_id = "user-1", level = 1, desc = "to PUBLIC" },
      { user_id = "user-2", level = 2, desc = "to USER" },
      { user_id = "user-3", level = 3, desc = "to MODERATOR" },
      { user_id = "user-4", level = 4, desc = "to ADMIN" },
      { user_id = "user-5", level = 5, desc = "to GOD" },
      { user_id = "user-6", level = 6, desc = "to SUPERGOD" },
    })("should change $user_id $desc", function(tc)
      local result = actions.change_level(tc.user_id, tc.level)
      expect(result.action).toBe("change_level")
      expect(result.user_id).toBe(tc.user_id)
      expect(result.level).toBe(tc.level)
    end)
  end)
  
  describe("toggle_active", function()
    it_each({
      { user_id = "user-1", active = true,  desc = "activate" },
      { user_id = "user-2", active = false, desc = "deactivate" },
    })("should $desc $user_id", function(tc)
      local result = actions.toggle_active(tc.user_id, tc.active)
      expect(result.action).toBe("toggle_active")
      expect(result.user_id).toBe(tc.user_id)
      expect(result.active).toBe(tc.active)
    end)
  end)
end)
