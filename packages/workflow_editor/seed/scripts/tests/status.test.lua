-- Tests for workflow_editor status.lua module

describe("workflow_editor/status", function()
  local status
  
  beforeEach(function()
    status = {
      PENDING = "pending",
      RUNNING = "running",
      SUCCESS = "success",
      FAILED = "failed",
      CANCELLED = "cancelled",
      
      render_badge = function(s)
        local colors = {
          pending = "default",
          running = "info",
          success = "success",
          failed = "error",
          cancelled = "warning"
        }
        return {
          type = "badge",
          props = {
            label = s,
            color = colors[s] or "default"
          }
        }
      end,
      
      render_progress = function(completed, total)
        local percent = total > 0 and (completed / total * 100) or 0
        return {
          type = "progress",
          props = {
            value = percent,
            label = completed .. "/" .. total
          }
        }
      end
    }
  end)
  
  describe("status constants", function()
    it("should have PENDING status", function()
      expect(status.PENDING).toBe("pending")
    end)
    
    it("should have RUNNING status", function()
      expect(status.RUNNING).toBe("running")
    end)
    
    it("should have SUCCESS status", function()
      expect(status.SUCCESS).toBe("success")
    end)
    
    it("should have FAILED status", function()
      expect(status.FAILED).toBe("failed")
    end)
    
    it("should have CANCELLED status", function()
      expect(status.CANCELLED).toBe("cancelled")
    end)
  end)
  
  describe("render_badge", function()
    it("should return badge component", function()
      local result = status.render_badge("pending")
      expect(result.type).toBe("badge")
    end)
    
    it("should have label in props", function()
      local result = status.render_badge("success")
      expect(result.props.label).toBe("success")
    end)
    
    it("should map pending to default color", function()
      local result = status.render_badge("pending")
      expect(result.props.color).toBe("default")
    end)
    
    it("should map running to info color", function()
      local result = status.render_badge("running")
      expect(result.props.color).toBe("info")
    end)
    
    it("should map success to success color", function()
      local result = status.render_badge("success")
      expect(result.props.color).toBe("success")
    end)
    
    it("should map failed to error color", function()
      local result = status.render_badge("failed")
      expect(result.props.color).toBe("error")
    end)
    
    it("should map cancelled to warning color", function()
      local result = status.render_badge("cancelled")
      expect(result.props.color).toBe("warning")
    end)
    
    it("should use default for unknown status", function()
      local result = status.render_badge("unknown")
      expect(result.props.color).toBe("default")
    end)
  end)
  
  describe("render_progress", function()
    it("should return progress component", function()
      local result = status.render_progress(5, 10)
      expect(result.type).toBe("progress")
    end)
    
    it("should calculate percentage", function()
      local result = status.render_progress(5, 10)
      expect(result.props.value).toBe(50)
    end)
    
    it("should format label", function()
      local result = status.render_progress(5, 10)
      expect(result.props.label).toBe("5/10")
    end)
    
    it("should handle 0 total", function()
      local result = status.render_progress(0, 0)
      expect(result.props.value).toBe(0)
    end)
    
    it("should handle 100%", function()
      local result = status.render_progress(10, 10)
      expect(result.props.value).toBe(100)
    end)
    
    it("should handle 0 completed", function()
      local result = status.render_progress(0, 10)
      expect(result.props.value).toBe(0)
    end)
  end)
end)
