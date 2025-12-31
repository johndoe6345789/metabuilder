-- Example: How to use the JSON script executor
-- This demonstrates running functions defined in script.json

local script_executor = require("script_executor")

-- Example 1: Execute the 'delay' function from script.json
print("=== Example 1: Delay Function ===")
local result = script_executor.load_and_execute(
  "../../script.json",
  "delay",
  {1000} -- args: ms = 1000
)
print("Delay function returned:", result)

-- Example 2: Execute 'fetchUserData' function
print("\n=== Example 2: Fetch User Data ===")
local user_data = script_executor.load_and_execute(
  "../../script.json",
  "fetchUserData",
  {"user123", {timeout = 5000}} -- args: userId, options
)
print("User data:", user_data)

-- Example 3: Direct execution without file loading
print("\n=== Example 3: Direct Execution ===")
local json = require("json")
local file = io.open("../../script.json", "r")
local script_json = json.decode(file:read("*all"))
file:close()

local result = script_executor.execute_function(
  script_json,
  "retryWithBackoff",
  {function() return "success!" end, 3}
)
print("Retry result:", result)

print("\n=== All Examples Complete ===")
