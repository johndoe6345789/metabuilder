/**
 * Node Definitions
 * Category and node type definitions for the workflow editor
 */

import type { NodeCategories, NodeType } from './types';

export const NODE_CATEGORIES: NodeCategories = {
  triggers: { id: 'triggers', name: 'Triggers', color: '#10b981' },
  actions: { id: 'actions', name: 'Actions', color: '#3b82f6' },
  logic: { id: 'logic', name: 'Logic', color: '#8b5cf6' },
  data: { id: 'data', name: 'Data', color: '#f59e0b' },
  integrations: { id: 'integrations', name: 'Integrations', color: '#ec4899' },
  utils: { id: 'utils', name: 'Utilities', color: '#6b7280' },
};

export const NODE_TYPES: NodeType[] = [
  // Triggers
  { id: 'webhook', type: 'trigger', category: 'triggers', name: 'Webhook', icon: 'globe', color: '#10b981', description: 'Start workflow on HTTP request', inputs: [], outputs: ['main'], defaultConfig: { method: 'POST', path: '/webhook' } },
  { id: 'schedule', type: 'trigger', category: 'triggers', name: 'Schedule', icon: 'clock', color: '#10b981', description: 'Run on a schedule (cron)', inputs: [], outputs: ['main'], defaultConfig: { cron: '0 * * * *' } },
  { id: 'manual', type: 'trigger', category: 'triggers', name: 'Manual', icon: 'hand', color: '#10b981', description: 'Trigger manually', inputs: [], outputs: ['main'], defaultConfig: {} },
  { id: 'email_trigger', type: 'trigger', category: 'triggers', name: 'Email Received', icon: 'mail', color: '#10b981', description: 'Trigger on email', inputs: [], outputs: ['main'], defaultConfig: { mailbox: 'INBOX' } },
  { id: 'file_watch', type: 'trigger', category: 'triggers', name: 'File Watch', icon: 'file-input', color: '#10b981', description: 'Watch for file changes', inputs: [], outputs: ['main'], defaultConfig: { path: '', events: ['create', 'modify'] } },
  // Actions
  { id: 'http_request', type: 'action', category: 'actions', name: 'HTTP Request', icon: 'send', color: '#3b82f6', description: 'Make HTTP requests', inputs: ['main'], outputs: ['success', 'error'], defaultConfig: { method: 'GET', url: '', headers: {} } },
  { id: 'code', type: 'action', category: 'actions', name: 'Code', icon: 'code', color: '#3b82f6', description: 'Execute custom code', inputs: ['main'], outputs: ['main'], defaultConfig: { language: 'javascript', code: '// Your code here\nreturn items;' } },
  { id: 'set_variable', type: 'action', category: 'actions', name: 'Set Variable', icon: 'variable', color: '#3b82f6', description: 'Set workflow variables', inputs: ['main'], outputs: ['main'], defaultConfig: { name: '', value: '' } },
  { id: 'send_email', type: 'action', category: 'actions', name: 'Send Email', icon: 'mail', color: '#3b82f6', description: 'Send an email', inputs: ['main'], outputs: ['main'], defaultConfig: { to: '', subject: '', body: '' } },
  { id: 'execute_command', type: 'action', category: 'actions', name: 'Execute Command', icon: 'code', color: '#3b82f6', description: 'Run shell command', inputs: ['main'], outputs: ['main', 'error'], defaultConfig: { command: '' } },
  { id: 'wait', type: 'action', category: 'actions', name: 'Wait', icon: 'clock', color: '#3b82f6', description: 'Pause execution', inputs: ['main'], outputs: ['main'], defaultConfig: { duration: 1000 } },
  // Logic
  { id: 'if', type: 'logic', category: 'logic', name: 'IF', icon: 'split', color: '#8b5cf6', description: 'Conditional branching', inputs: ['main'], outputs: ['true', 'false'], defaultConfig: { condition: '', operator: 'equals', value: '' } },
  { id: 'switch', type: 'logic', category: 'logic', name: 'Switch', icon: 'shuffle', color: '#8b5cf6', description: 'Multi-way branching', inputs: ['main'], outputs: ['case1', 'case2', 'default'], defaultConfig: { expression: '', cases: [] } },
  { id: 'merge', type: 'logic', category: 'logic', name: 'Merge', icon: 'merge', color: '#8b5cf6', description: 'Merge multiple inputs', inputs: ['input1', 'input2'], outputs: ['main'], defaultConfig: { mode: 'append' } },
  { id: 'loop', type: 'logic', category: 'logic', name: 'Loop', icon: 'transform', color: '#8b5cf6', description: 'Iterate over items', inputs: ['main'], outputs: ['item', 'done'], defaultConfig: { mode: 'each' } },
  { id: 'filter', type: 'logic', category: 'logic', name: 'Filter', icon: 'split', color: '#8b5cf6', description: 'Filter items', inputs: ['main'], outputs: ['match', 'noMatch'], defaultConfig: { condition: '' } },
  { id: 'error_handler', type: 'logic', category: 'logic', name: 'Error Handler', icon: 'split', color: '#8b5cf6', description: 'Catch errors', inputs: ['main'], outputs: ['success', 'error'], defaultConfig: {} },
  // Data
  { id: 'read_file', type: 'data', category: 'data', name: 'Read File', icon: 'file-input', color: '#f59e0b', description: 'Read file contents', inputs: ['main'], outputs: ['main'], defaultConfig: { path: '', encoding: 'utf-8' } },
  { id: 'write_file', type: 'data', category: 'data', name: 'Write File', icon: 'file-output', color: '#f59e0b', description: 'Write to a file', inputs: ['main'], outputs: ['main'], defaultConfig: { path: '', content: '', encoding: 'utf-8' } },
  { id: 'transform', type: 'data', category: 'data', name: 'Transform', icon: 'transform', color: '#f59e0b', description: 'Transform data structure', inputs: ['main'], outputs: ['main'], defaultConfig: { mapping: {} } },
  { id: 'parse_json', type: 'data', category: 'data', name: 'Parse JSON', icon: 'code', color: '#f59e0b', description: 'Parse JSON string', inputs: ['main'], outputs: ['main'], defaultConfig: {} },
  { id: 'stringify_json', type: 'data', category: 'data', name: 'Stringify JSON', icon: 'code', color: '#f59e0b', description: 'Convert to JSON string', inputs: ['main'], outputs: ['main'], defaultConfig: { pretty: true } },
  { id: 'database_query', type: 'data', category: 'data', name: 'Database Query', icon: 'variable', color: '#f59e0b', description: 'Execute SQL query', inputs: ['main'], outputs: ['main', 'error'], defaultConfig: { query: '' } },
  // Integrations
  { id: 'slack_message', type: 'integration', category: 'integrations', name: 'Slack Message', icon: 'send', color: '#ec4899', description: 'Send Slack message', inputs: ['main'], outputs: ['main'], defaultConfig: { channel: '', message: '' } },
  { id: 'github_action', type: 'integration', category: 'integrations', name: 'GitHub', icon: 'code', color: '#ec4899', description: 'GitHub operations', inputs: ['main'], outputs: ['main', 'error'], defaultConfig: { action: 'create_issue' } },
  { id: 'openai_chat', type: 'integration', category: 'integrations', name: 'OpenAI Chat', icon: 'send', color: '#ec4899', description: 'Chat with GPT', inputs: ['main'], outputs: ['main'], defaultConfig: { model: 'gpt-4', prompt: '' } },
  { id: 'aws_s3', type: 'integration', category: 'integrations', name: 'AWS S3', icon: 'globe', color: '#ec4899', description: 'S3 operations', inputs: ['main'], outputs: ['main', 'error'], defaultConfig: { action: 'get', bucket: '', key: '' } },
  // Utilities
  { id: 'log', type: 'util', category: 'utils', name: 'Log', icon: 'code', color: '#6b7280', description: 'Log to console', inputs: ['main'], outputs: ['main'], defaultConfig: { level: 'info' } },
  { id: 'debug', type: 'util', category: 'utils', name: 'Debug', icon: 'variable', color: '#6b7280', description: 'Debug breakpoint', inputs: ['main'], outputs: ['main'], defaultConfig: {} },
  { id: 'comment', type: 'util', category: 'utils', name: 'Comment', icon: 'code', color: '#6b7280', description: 'Add a comment', inputs: [], outputs: [], defaultConfig: { text: '' } },
  { id: 'no_op', type: 'util', category: 'utils', name: 'No Operation', icon: 'clock', color: '#6b7280', description: 'Pass through', inputs: ['main'], outputs: ['main'], defaultConfig: {} },
];

/**
 * Generate a unique node ID
 */
export const generateNodeId = (): string =>
  `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Generate a unique connection ID
 */
export const generateConnectionId = (): string =>
  `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
