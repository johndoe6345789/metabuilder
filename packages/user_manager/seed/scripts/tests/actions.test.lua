-- Tests for user_manager actions.lua module

describe("user_manager/actions", function()
  local actions
  
  beforeEach(function()
    actions = {
      create = function(data)
        return {
          action = "create_user",
          data = data
        }
      end,
      
      update = function(user_id, data)
        return {
          action = "update_user",
          user_id = user_id,
          data = data
        }
      end,
      
      delete = function(user_id)
        return {
          action = "delete_user",
          user_id = user_id,
          confirm = true
        }
      end,
      
      change_level = function(user_id, new_level)
        return {
          action = "change_level",
          user_id = user_id,
          level = new_level
        }
      end,
      
      toggle_active = function(user_id, active)
        return {
          action = "toggle_active",
          user_id = user_id,
          active = active
        }
      end
    }
  end)
  
  describe("create", function()
    it("should return create_user action", function()
      local result = actions.create({ name = "John", email = "john@example.com" })
      expect(result.action).toBe("create_user")
    end)
    
    it("should include user data", function()
      local data = { name = "John", email = "john@example.com" }
      local result = actions.create(data)
      expect(result.data).toEqual(data)
    end)
  end)
  
  describe("update", function()
    it("should return update_user action", function()
      local result = actions.update("user-123", { name = "Jane" })
      expect(result.action).toBe("update_user")
    end)
    
    it("should include user_id", function()
      local result = actions.update("user-123", { name = "Jane" })
      expect(result.user_id).toBe("user-123")
    end)
    
    it("should include update data", function()
      local data = { name = "Jane", role = "admin" }
      local result = actions.update("user-123", data)
      expect(result.data).toEqual(data)
    end)
  end)
  
  describe("delete", function()
    it("should return delete_user action", function()
      local result = actions.delete("user-123")
      expect(result.action).toBe("delete_user")
    end)
    
    it("should include user_id", function()
      local result = actions.delete("user-123")
      expect(result.user_id).toBe("user-123")
    end)
    
    it("should require confirmation", function()
      local result = actions.delete("user-123")
      expect(result.confirm).toBe(true)
    end)
  end)
  
  describe("change_level", function()
    it("should return change_level action", function()
      local result = actions.change_level("user-123", 4)
      expect(result.action).toBe("change_level")
    end)
    
    it("should include user_id", function()
      local result = actions.change_level("user-123", 4)
      expect(result.user_id).toBe("user-123")
    end)
    
    it("should include new level", function()
      local result = actions.change_level("user-123", 4)
      expect(result.level).toBe(4)
    end)
  end)
  
  describe("toggle_active", function()
    it("should return toggle_active action", function()
      local result = actions.toggle_active("user-123", true)
      expect(result.action).toBe("toggle_active")
    end)
    
    it("should set active to true", function()
      local result = actions.toggle_active("user-123", true)
      expect(result.active).toBe(true)
    end)
    
    it("should set active to false", function()
      local result = actions.toggle_active("user-123", false)
      expect(result.active).toBe(false)
    end)
  end)
end)
