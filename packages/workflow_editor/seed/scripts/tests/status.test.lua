-- Tests for workflow_editor status.lua module
-- Loads test cases from JSON file

local cases = load_cases("status.cases.json")

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
    it_each(cases.status_constants)("should have $name = $value", function(tc)
      expect(status[tc.name]).toBe(tc.value)
    end)
  end)
  
  describe("render_badge", function()
    it_each(cases.render_badge)("should render $desc with $color color", function(tc)
      local result = status.render_badge(tc.status)
      expect(result.type).toBe("badge")
      expect(result.props.label).toBe(tc.status)
      expect(result.props.color).toBe(tc.color)
    end)
  end)
  
  describe("render_progress", function()
    it_each(cases.render_progress)("should render $completed/$total as $percent%", function(tc)
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
