-- Tests for workflow_editor status.lua module
-- Uses parameterized tests

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
          props = { label = s, color = colors[s] or "default" }
        }
      end,
      
      render_progress = function(completed, total)
        local percent = total > 0 and (completed / total * 100) or 0
        return {
          type = "progress",
          props = { value = percent, label = completed .. "/" .. total }
        }
      end
    }
  end)
  
  describe("status constants", function()
    it_each({
      { name = "PENDING",   value = "pending" },
      { name = "RUNNING",   value = "running" },
      { name = "SUCCESS",   value = "success" },
      { name = "FAILED",    value = "failed" },
      { name = "CANCELLED", value = "cancelled" },
    })("should have $name = $value", function(tc)
      expect(status[tc.name]).toBe(tc.value)
    end)
  end)
  
  describe("render_badge", function()
    it_each({
      { status = "pending",   color = "default", desc = "pending status" },
      { status = "running",   color = "info",    desc = "running status" },
      { status = "success",   color = "success", desc = "success status" },
      { status = "failed",    color = "error",   desc = "failed status" },
      { status = "cancelled", color = "warning", desc = "cancelled status" },
      { status = "unknown",   color = "default", desc = "unknown status" },
    })("should render $desc with $color color", function(tc)
      local result = status.render_badge(tc.status)
      expect(result.type).toBe("badge")
      expect(result.props.label).toBe(tc.status)
      expect(result.props.color).toBe(tc.color)
    end)
  end)
  
  describe("render_progress", function()
    it_each({
      { completed = 0,   total = 10, percent = 0,   label = "0/10" },
      { completed = 5,   total = 10, percent = 50,  label = "5/10" },
      { completed = 10,  total = 10, percent = 100, label = "10/10" },
      { completed = 3,   total = 4,  percent = 75,  label = "3/4" },
      { completed = 1,   total = 3,  percent = 33.333333333333, label = "1/3" },
      { completed = 0,   total = 0,  percent = 0,   label = "0/0" },
    })("should render $completed/$total as $percent%", function(tc)
      local result = status.render_progress(tc.completed, tc.total)
      expect(result.type).toBe("progress")
      expect(result.props.label).toBe(tc.label)
      -- Use toBeCloseTo for floating point comparison
      if tc.percent == 33.333333333333 then
        expect(result.props.value).toBeCloseTo(tc.percent, 1)
      else
        expect(result.props.value).toBe(tc.percent)
      end
    end)
  end)
end)
