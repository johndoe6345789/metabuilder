/**
 * JSON Script Runtime Executor (CommonJS version)
 * Executes script.json definitions at runtime without code generation
 */

/**
 * Reference resolver - resolves $ref:path.to.value
 */
function resolveRef(ref, context) {
  if (typeof ref !== 'string' || !ref.startsWith('$ref:')) {
    return ref;
  }

  const path = ref.substring(5); // Remove "$ref:"
  const parts = path.split('.');

  let value = context;
  for (const part of parts) {
    if (value === null || typeof value !== 'object') {
      return undefined;
    }
    value = value[part];
  }

  return value;
}

/**
 * Expression evaluator
 */
function evalExpression(expr, context) {
  if (typeof expr !== 'object' || expr === null) {
    return resolveRef(expr, context);
  }

  const exprType = expr.type;

  // Literal values
  if (exprType === 'string_literal') return expr.value;
  if (exprType === 'number_literal') return expr.value;
  if (exprType === 'boolean_literal') return expr.value;
  if (exprType === 'null_literal') return null;

  // Template literals
  if (exprType === 'template_literal') {
    const template = expr.template;
    return template.replace(/\$\{([^}]+)\}/g, (match, varPath) => {
      const ref = `$ref:local.${varPath}`;
      const value = resolveRef(ref, context);
      return value !== undefined ? String(value) : '';
    });
  }

  // Binary expressions
  if (exprType === 'binary_expression') {
    const left = evalExpression(expr.left, context);
    const right = evalExpression(expr.right, context);
    const op = expr.operator;

    switch (op) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return left / right;
      case '%': return left % right;
      case '==':
      case '===': return left === right;
      case '!=':
      case '!==': return left !== right;
      case '<': return left < right;
      case '>': return left > right;
      case '<=': return left <= right;
      case '>=': return left >= right;
      default: return undefined;
    }
  }

  // Logical expressions (short-circuit evaluation)
  if (exprType === 'logical_expression') {
    const op = expr.operator;

    if (op === '&&' || op === 'and') {
      const left = evalExpression(expr.left, context);
      if (!left) return left;
      return evalExpression(expr.right, context);
    }
    if (op === '||' || op === 'or') {
      const left = evalExpression(expr.left, context);
      if (left) return left;
      return evalExpression(expr.right, context);
    }
    if (op === '??') {
      const left = evalExpression(expr.left, context);
      if (left !== null && left !== undefined) return left;
      return evalExpression(expr.right, context);
    }
  }

  // Unary expressions
  if (exprType === 'unary_expression') {
    const arg = evalExpression(expr.argument, context);
    const op = expr.operator;

    switch (op) {
      case '!':
      case 'not': return !arg;
      case '-': return -arg;
      case '+': return +arg;
      case '~': return ~arg;
      case 'typeof': return typeof arg;
      default: return undefined;
    }
  }

  // Conditional expression (ternary)
  if (exprType === 'conditional_expression') {
    const test = evalExpression(expr.test, context);
    if (test) {
      return evalExpression(expr.consequent, context);
    } else {
      return evalExpression(expr.alternate, context);
    }
  }

  // Member access
  if (exprType === 'member_access') {
    const obj = evalExpression(expr.object, context);
    if (obj !== null && typeof obj === 'object') {
      if (expr.computed) {
        const prop = evalExpression(expr.property, context);
        return obj[prop];
      } else {
        return obj[expr.property];
      }
    }
    return undefined;
  }

  // Call expression
  if (exprType === 'call_expression') {
    const callee = resolveRef(expr.callee, context);
    const args = [];
    if (expr.args) {
      for (const arg of expr.args) {
        args.push(evalExpression(arg, context));
      }
    }

    if (typeof callee === 'function') {
      return callee(...args);
    }
    return undefined;
  }

  // Object literal
  if (exprType === 'object_literal') {
    const obj = {};
    if (expr.properties) {
      for (const [key, value] of Object.entries(expr.properties)) {
        obj[key] = evalExpression(value, context);
      }
    }
    return obj;
  }

  // Array literal
  if (exprType === 'array_literal') {
    const arr = [];
    if (expr.elements) {
      for (const elem of expr.elements) {
        arr.push(evalExpression(elem, context));
      }
    }
    return arr;
  }

  return undefined;
}

/**
 * Statement executor
 */
function executeStatement(stmt, context) {
  const stmtType = stmt.type;

  // Variable declarations
  if (stmtType === 'const_declaration' || stmtType === 'let_declaration') {
    const name = stmt.name;
    const value = evalExpression(stmt.value, context);
    context.local_vars = context.local_vars || {};
    context.local_vars[name] = value;
    return null;
  }

  // Assignment
  if (stmtType === 'assignment') {
    const target = stmt.target;
    const value = evalExpression(stmt.value, context);

    if (typeof target === 'string' && target.startsWith('$ref:')) {
      const path = target.substring(5);
      const parts = path.split('.');

      if (parts.length === 2 && parts[0] === 'local') {
        context.local_vars = context.local_vars || {};
        context.local_vars[parts[1]] = value;
      } else if (parts.length === 2 && parts[0] === 'params') {
        context.params[parts[1]] = value;
      }
    } else if (typeof target === 'string') {
      context.local_vars = context.local_vars || {};
      context.local_vars[target] = value;
    }
    return null;
  }

  // If statement
  if (stmtType === 'if_statement') {
    const condition = evalExpression(stmt.condition, context);
    if (condition) {
      if (stmt.then) {
        for (const s of stmt.then) {
          const result = executeStatement(s, context);
          if (result && result.type === 'return') {
            return result;
          }
        }
      }
    } else if (stmt.else) {
      for (const s of stmt.else) {
        const result = executeStatement(s, context);
        if (result && result.type === 'return') {
          return result;
        }
      }
    }
    return null;
  }

  // Return statement
  if (stmtType === 'return') {
    return {
      type: 'return',
      value: evalExpression(stmt.value, context)
    };
  }

  // Try-catch
  if (stmtType === 'try_catch') {
    try {
      if (stmt.try) {
        for (const s of stmt.try) {
          const result = executeStatement(s, context);
          if (result && result.type === 'return') {
            return result;
          }
        }
      }
    } catch (err) {
      if (stmt.catch) {
        context.catch = context.catch || {};
        context.catch[stmt.catch.param || 'err'] = err;

        for (const s of stmt.catch.body) {
          const result = executeStatement(s, context);
          if (result && result.type === 'return') {
            return result;
          }
        }
      }
    } finally {
      if (stmt.finally) {
        for (const s of stmt.finally) {
          executeStatement(s, context);
        }
      }
    }

    return null;
  }

  // Call expression statement
  if (stmtType === 'call_expression') {
    evalExpression(stmt, context);
    return null;
  }

  // For-each loop
  if (stmtType === 'for_each_loop') {
    const iterable = evalExpression(stmt.iterable, context);
    if (Array.isArray(iterable)) {
      context.local_vars = context.local_vars || {};
      for (const item of iterable) {
        context.local_vars[stmt.iterator] = item;
        if (stmt.body) {
          for (const s of stmt.body) {
            const result = executeStatement(s, context);
            if (result && result.type === 'return') {
              return result;
            }
          }
        }
      }
    }
    return null;
  }

  // Comment (ignored at runtime)
  if (stmtType === 'comment') {
    return null;
  }

  return null;
}

/**
 * Execute function from script.json
 */
function executeFunction(scriptJson, functionName, args = []) {
  const funcDef = (scriptJson.functions || []).find(fn => fn.name === functionName);

  if (!funcDef) {
    throw new Error(`Function not found: ${functionName}`);
  }

  const context = {
    params: {},
    local_vars: {},
    constants: {},
    imports: {},
    functions: {}
  };

  // Load constants
  for (const constant of (scriptJson.constants || [])) {
    context.constants[constant.name] = constant.value;
  }

  // Set parameters with defaults
  for (let i = 0; i < (funcDef.params || []).length; i++) {
    const param = funcDef.params[i];
    let value = args[i];

    if (value === undefined && param.default !== undefined) {
      if (typeof param.default === 'string' && param.default.startsWith('$ref:')) {
        value = resolveRef(param.default, context);
      } else if (typeof param.default === 'object' && param.default !== null) {
        value = evalExpression(param.default, context);
      } else {
        value = param.default;
      }
    }

    context.params[param.name] = value;
  }

  // Execute function body
  for (const stmt of (funcDef.body || [])) {
    const result = executeStatement(stmt, context);
    if (result && result.type === 'return') {
      return result.value;
    }
  }

  return undefined;
}

/**
 * Load and execute synchronously
 */
function loadAndExecuteSync(jsonPath, functionName, args = []) {
  const fs = require('fs');
  const content = fs.readFileSync(jsonPath, 'utf-8');
  const scriptJson = JSON.parse(content);
  return executeFunction(scriptJson, functionName, args);
}

module.exports = {
  executeFunction,
  loadAndExecuteSync,
  resolveRef,
  evalExpression,
  executeStatement
};
