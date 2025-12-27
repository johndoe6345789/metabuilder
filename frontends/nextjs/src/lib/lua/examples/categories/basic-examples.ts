/**
 * @file basic-examples.ts
 * @description Basic Lua examples for beginners
 */

export const basicExamples = {
  basic: `-- Basic Hello World
log("Hello from Lua!")
return { message = "Success", timestamp = os.time() }`,

  conditional: `-- Conditional Logic Example
-- Workflow decision making
local status = context.data.status or "pending"

if status == "approved" then
  log("Processing approved workflow")
  return { action = "continue", message = "Approved - proceeding" }
elseif status == "rejected" then
  log("Halting rejected workflow")
  return { action = "halt", message = "Rejected - stopping" }
else
  log("Waiting for review")
  return { action = "wait", message = "Pending review" }
end`,
}
