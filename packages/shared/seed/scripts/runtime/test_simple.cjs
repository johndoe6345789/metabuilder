const { executeFunction, executeStatement, evalExpression } = require('./script_executor.cjs');
const fs = require('fs');

const scriptContent = fs.readFileSync('../../../../json_script_example/seed/script.json', 'utf-8');
const scriptJson = JSON.parse(scriptContent);

// Test basic execution
console.log('Testing all_expressions with args [10, 5]...\n');

// Manual test of first few statements
const context = {
  params: { a: 10, b: 5 },
  local_vars: {},
  constants: {},
  imports: {},
  functions: {}
};

// Test first statement (sum)
const sumStmt = scriptJson.functions[0].body[1]; // First non-comment
console.log('Executing sum statement...');
const sumResult = executeStatement(sumStmt, context);
console.log('Sum result:', sumResult);
console.log('Context after sum:', context.local_vars);

// Test return statement
const returnStmt = scriptJson.functions[0].body[scriptJson.functions[0].body.length - 1];
console.log('\nReturn statement:', JSON.stringify(returnStmt, null, 2));
console.log('\nExecuting return statement...');
const ret = executeStatement(returnStmt, context);
console.log('Return value:', ret);

console.log('\n\nNow testing full execution with instrumented executor...');

// Create instrumented version
const instrumentedExecuteFunction = (scriptJson, functionName, args = []) => {
  const funcDef = (scriptJson.functions || []).find(fn => fn.name === functionName);
  if (!funcDef) throw new Error(`Function not found: ${functionName}`);

  const context = {
    params: {},
    local_vars: {},
    constants: {},
    imports: {},
    functions: {}
  };

  // Set parameters
  for (let i = 0; i < (funcDef.params || []).length; i++) {
    const param = funcDef.params[i];
    context.params[param.name] = args[i];
  }

  console.log('Initial params:', context.params);

  // Execute function body
  for (let i = 0; i < (funcDef.body || []).length; i++) {
    const stmt = funcDef.body[i];
    console.log(`\nStatement ${i}:`, stmt.type, stmt.name || '');
    const result = executeStatement(stmt, context);
    console.log('Local vars after statement:', Object.keys(context.local_vars));
    if (result && result.type === 'return') {
      console.log('\nFinal context before return:', context.local_vars);
      console.log('Return statement value:', stmt.value);
      console.log('Evaluated return value:', result.value);
      return result.value;
    }
  }

  return undefined;
};

const result = instrumentedExecuteFunction(scriptJson, 'all_expressions', [10, 5]);
console.log('\n\nFinal Result:', JSON.stringify(result, null, 2));
