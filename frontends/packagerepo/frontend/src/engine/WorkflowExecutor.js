/**
 * Frontend Workflow Executor
 * Executes JSON-defined workflows in the browser
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Built-in node type handlers
const nodeHandlers = {
  // API operations
  'api.get': async (params, context) => {
    const endpoint = interpolate(params.endpoint, context);
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${context.$token}` },
    });
    const data = await res.json();
    if (params.out) context[params.out] = data;
    return data;
  },

  'api.put': async (params, context) => {
    const endpoint = interpolate(params.endpoint, context);
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${context.$token}`,
        'Content-Type': params.contentType || 'application/json',
      },
      body: params.contentType === 'application/octet-stream'
        ? resolve(params.body, context)
        : JSON.stringify(resolve(params.body, context)),
    });
    const data = await res.json();
    if (params.out) context[params.out] = { ...data, ok: res.ok };
    return data;
  },

  'api.post': async (params, context) => {
    const endpoint = interpolate(params.endpoint, context);
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${context.$token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resolve(params.body, context)),
    });
    const data = await res.json();
    if (params.out) context[params.out] = { ...data, ok: res.ok };
    return data;
  },

  // List operations
  'list.filter': async (params, context) => {
    const input = resolve(params.input, context) || [];
    const filtered = input.filter((item) => {
      // Simple condition evaluation
      const condition = params.condition
        .replace(/item\./g, 'item.')
        .replace(/\$(\w+)/g, (_, key) => JSON.stringify(context[key] || ''));
      try {
        return new Function('item', `return ${condition}`)(item);
      } catch {
        return false;
      }
    });
    if (params.out) context[params.out] = filtered;
    return filtered;
  },

  'list.map': async (params, context) => {
    const input = resolve(params.input, context) || [];
    const mapped = input.map((item, index) => {
      context.$item = item;
      context.$index = index;
      return resolve(params.transform, context);
    });
    if (params.out) context[params.out] = mapped;
    return mapped;
  },

  // String operations
  'string.format': async (params, context) => {
    const result = interpolate(params.template, { ...context, ...resolve(params.values, context) });
    if (params.out) context[params.out] = result;
    return result;
  },

  // Logic operations
  'logic.if': async (params, context) => {
    const condition = resolve(params.condition, context);
    return condition ? params.then : params.else;
  },

  // Validation
  'validate.required': async (params, context) => {
    const input = resolve(params.input, context) || {};
    const missing = params.fields.filter((f) => !input[f]);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    return true;
  },

  // Output
  'output.set': async (params, context) => {
    const value = resolve(params.value, context);
    context.$output = context.$output || {};
    context.$output[params.key] = value;
    return value;
  },
};

// Resolve $variable references in values
function resolve(value, context) {
  if (typeof value === 'string' && value.startsWith('$')) {
    const path = value.slice(1).split('.');
    let result = context;
    for (const key of path) {
      result = result?.[key];
    }
    return result;
  }
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return value.map((v) => resolve(v, context));
    }
    const resolved = {};
    for (const [k, v] of Object.entries(value)) {
      resolved[k] = resolve(v, context);
    }
    return resolved;
  }
  return value;
}

// Interpolate {variable} and $variable in strings
function interpolate(str, context) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/\{(\w+)\}/g, (_, key) => context[key] ?? '')
    .replace(/\$(\w+(?:\.\w+)*)/g, (_, path) => {
      const keys = path.split('.');
      let result = context;
      for (const key of keys) {
        result = result?.[key];
      }
      return result ?? '';
    });
}

/**
 * Execute a workflow definition
 * @param {Object} workflow - The workflow JSON definition
 * @param {Object} inputs - Input values for the workflow
 * @param {Object} options - Execution options (token, etc.)
 * @returns {Object} - Workflow outputs
 */
export async function executeWorkflow(workflow, inputs = {}, options = {}) {
  const context = {
    ...inputs,
    $token: options.token || localStorage.getItem('token'),
    $output: {},
  };

  // Build node lookup
  const nodes = {};
  workflow.nodes.forEach((node) => {
    nodes[node.id] = node;
    nodes[node.name] = node;
  });

  // Execute nodes in connection order (simplified linear execution)
  const executed = new Set();
  const queue = [workflow.nodes[0]];

  while (queue.length > 0) {
    const node = queue.shift();
    if (!node || executed.has(node.id)) continue;

    executed.add(node.id);

    const handler = nodeHandlers[node.type];
    if (handler) {
      try {
        const result = await handler(node.parameters, context);

        // Handle conditional branching
        if (node.type === 'logic.if' && workflow.connections[node.name]) {
          const branch = result;
          const connections = workflow.connections[node.name][branch];
          if (connections) {
            connections['0']?.forEach((conn) => queue.push(nodes[conn.node]));
          }
          continue;
        }
      } catch (error) {
        console.error(`Workflow node ${node.name} failed:`, error);
        context.$output.error = error.message;
        break;
      }
    }

    // Follow connections
    const connections = workflow.connections[node.name];
    if (connections?.main?.['0']) {
      connections.main['0'].forEach((conn) => queue.push(nodes[conn.node]));
    }
  }

  return context.$output;
}

/**
 * Hook for using workflows in React components
 */
export function useWorkflow(workflow) {
  return {
    execute: (inputs, options) => executeWorkflow(workflow, inputs, options),
  };
}

export default { executeWorkflow, useWorkflow };
