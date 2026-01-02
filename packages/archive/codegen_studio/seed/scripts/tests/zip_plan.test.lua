-- Tests for zip_plan.lua functions
-- Tests prepare_zip function for generating zip entries

local M = {}

---@param framework TestFramework
---@param assertions AssertionsModule
---@param mocks MocksModule
function M.defineTests(framework, assertions, mocks)
  local describe = framework.describe
  local it = framework.it
  local it_each = framework.it_each
  local beforeEach = framework.beforeEach
  local expect = assertions.expect
  
  local zip_plan = require("zip_plan")
  
  describe("zip_plan", function()
    
    describe("prepare_zip", function()
      
      describe("name handling", function()
        it_each({
          { name = "my-project", expected = "my-project", desc = "custom name" },
          { name = "test-app", expected = "test-app", desc = "another custom name" },
          { name = nil, expected = "project", desc = "nil defaults to project" }
        })("should use '$expected' for $desc", function(tc)
          local blueprint = { name = tc.name, files = {} }
          local result = zip_plan.prepare_zip(blueprint)
          expect(result.name).toBe(tc.expected)
        end)
      end)
      
      describe("files handling", function()
        it("should return empty entries for empty files array", function()
          local blueprint = { name = "test", files = {} }
          local result = zip_plan.prepare_zip(blueprint)
          expect(#result.entries).toBe(0)
        end)
        
        it("should return empty entries when files is nil", function()
          local blueprint = { name = "test" }
          local result = zip_plan.prepare_zip(blueprint)
          expect(#result.entries).toBe(0)
        end)
        
        it_each({
          { file_count = 1, desc = "single file" },
          { file_count = 3, desc = "three files" },
          { file_count = 5, desc = "five files" },
          { file_count = 10, desc = "ten files" }
        })("should create $file_count entries for $desc", function(tc)
          local files = {}
          for i = 1, tc.file_count do
            table.insert(files, { path = "file" .. i .. ".txt", content = "content" })
          end
          
          local blueprint = { name = "test", files = files }
          local result = zip_plan.prepare_zip(blueprint)
          expect(#result.entries).toBe(tc.file_count)
        end)
      end)
      
      describe("entry path mapping", function()
        it("should preserve file paths in entries", function()
          local blueprint = {
            name = "test",
            files = {
              { path = "src/index.ts", content = "code" },
              { path = "README.md", content = "readme" }
            }
          }
          
          local result = zip_plan.prepare_zip(blueprint)
          expect(result.entries[1].path).toBe("src/index.ts")
          expect(result.entries[2].path).toBe("README.md")
        end)
        
        it_each({
          { path = "simple.txt", desc = "simple filename" },
          { path = "dir/file.txt", desc = "one level deep" },
          { path = "a/b/c/d.txt", desc = "multiple levels deep" },
          { path = "file with spaces.txt", desc = "filename with spaces" },
          { path = ".hidden", desc = "hidden file" }
        })("should handle $desc path", function(tc)
          local blueprint = {
            name = "test",
            files = { { path = tc.path, content = "test" } }
          }
          
          local result = zip_plan.prepare_zip(blueprint)
          expect(result.entries[1].path).toBe(tc.path)
        end)
      end)
      
      describe("content size calculation", function()
        it_each({
          { content = "", expected_size = 0, desc = "empty content" },
          { content = "a", expected_size = 1, desc = "single character" },
          { content = "hello", expected_size = 5, desc = "short string" },
          { content = "hello world", expected_size = 11, desc = "string with space" },
          { content = "line1\nline2", expected_size = 11, desc = "multiline string" }
        })("should calculate size $expected_size for $desc", function(tc)
          local blueprint = {
            name = "test",
            files = { { path = "test.txt", content = tc.content } }
          }
          
          local result = zip_plan.prepare_zip(blueprint)
          expect(result.entries[1].size).toBe(tc.expected_size)
        end)
        
        it("should handle nil content as empty string", function()
          local blueprint = {
            name = "test",
            files = { { path = "test.txt", content = nil } }
          }
          
          local result = zip_plan.prepare_zip(blueprint)
          expect(result.entries[1].size).toBe(0)
        end)
        
        it("should calculate size for longer content", function()
          local content = string.rep("a", 1000)
          local blueprint = {
            name = "test",
            files = { { path = "test.txt", content = content } }
          }
          
          local result = zip_plan.prepare_zip(blueprint)
          expect(result.entries[1].size).toBe(1000)
        end)
      end)
      
      describe("complete blueprint handling", function()
        it("should process realistic blueprint", function()
          local blueprint = {
            name = "my-app",
            files = {
              { path = "my-app/README.md", content = "# my-app\n\nDescription\n" },
              { path = "my-app/package.json", content = '{\n  "name": "my-app"\n}\n' },
              { path = "my-app/src/index.ts", content = "console.log('hello');\n" }
            }
          }
          
          local result = zip_plan.prepare_zip(blueprint)
          
          expect(result.name).toBe("my-app")
          expect(#result.entries).toBe(3)
          
          -- Verify all paths preserved
          expect(result.entries[1].path).toBe("my-app/README.md")
          expect(result.entries[2].path).toBe("my-app/package.json")
          expect(result.entries[3].path).toBe("my-app/src/index.ts")
          
          -- Verify sizes calculated
          expect(result.entries[1].size).toBeGreaterThan(0)
          expect(result.entries[2].size).toBeGreaterThan(0)
          expect(result.entries[3].size).toBeGreaterThan(0)
        end)
        
        it("should handle mixed content with nil and empty strings", function()
          local blueprint = {
            name = "test",
            files = {
              { path = "file1.txt", content = "content" },
              { path = "file2.txt", content = nil },
              { path = "file3.txt", content = "" },
              { path = "file4.txt", content = "more content" }
            }
          }
          
          local result = zip_plan.prepare_zip(blueprint)
          
          expect(#result.entries).toBe(4)
          expect(result.entries[1].size).toBe(7)
          expect(result.entries[2].size).toBe(0)
          expect(result.entries[3].size).toBe(0)
          expect(result.entries[4].size).toBe(12)
        end)
      end)
      
      describe("entry order preservation", function()
        it("should maintain file order in entries", function()
          local blueprint = {
            name = "test",
            files = {
              { path = "first.txt", content = "1" },
              { path = "second.txt", content = "2" },
              { path = "third.txt", content = "3" }
            }
          }
          
          local result = zip_plan.prepare_zip(blueprint)
          
          expect(result.entries[1].path).toBe("first.txt")
          expect(result.entries[2].path).toBe("second.txt")
          expect(result.entries[3].path).toBe("third.txt")
        end)
      end)
      
    end)
    
  end)
end

return M
