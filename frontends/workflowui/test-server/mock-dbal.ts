/**
 * Mock DBAL Server for WorkflowUI Integration Testing
 * Simulates DBAL workflow API endpoints with in-memory storage
 * Enables full end-to-end testing without actual DBAL backend
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';

// =============================================================================
// TYPES
// =============================================================================

interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  config: Record<string, unknown>;
  inputs: string[];
  outputs: string[];
}

interface Connection {
  id: string;
  sourceNodeId: string;
  sourceOutput: string;
  targetNodeId: string;
  targetInput: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: Connection[];
  createdAt: string;
  updatedAt: string;
  tenantId: string;
  workspaceId?: string;
  status?: 'draft' | 'active' | 'archived';
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  workflowCount: number;
  lastActivity?: string;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  workflowId?: string;
  executionId?: string;
}

interface UserStats {
  nodesCreated: number;
  workflowsRun: number;
  failedRuns: number;
  timeSaved: string;
}

interface ExecutionResult {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'success' | 'error';
  startTime: string;
  endTime?: string;
  outputs: Record<string, unknown>;
  error?: string;
  nodeResults: Record<string, { status: string; output?: unknown; error?: string }>;
}

// =============================================================================
// IN-MEMORY STORAGE
// =============================================================================

const workflows = new Map<string, Workflow>();
const executions = new Map<string, ExecutionResult>();
const workspaces = new Map<string, Workspace>();
const notifications = new Map<string, Notification>();

const userStats: UserStats = {
  nodesCreated: 23,
  workflowsRun: 5,
  failedRuns: 1,
  timeSaved: '1.2h',
};

// =============================================================================
// MOCK WORKFLOW EXECUTION
// =============================================================================

async function executeWorkflow(workflow: Workflow): Promise<ExecutionResult> {
  const executionId = uuidv4();
  const startTime = new Date().toISOString();

  const execution: ExecutionResult = {
    id: executionId,
    workflowId: workflow.id,
    status: 'running',
    startTime,
    outputs: {},
    nodeResults: {},
  };

  executions.set(executionId, execution);

  // Create notification
  const notification: Notification = {
    id: uuidv4(),
    type: 'info',
    title: 'Workflow Started',
    message: `Workflow "${workflow.name}" has started execution`,
    timestamp: startTime,
    read: false,
    workflowId: workflow.id,
    executionId,
  };
  notifications.set(notification.id, notification);

  // Simulate async execution
  setTimeout(() => {
    try {
      // Simple topological sort for node execution order
      const nodeMap = new Map(workflow.nodes.map((n) => [n.id, n]));
      const executed = new Set<string>();
      const nodeOutputs = new Map<string, unknown>();

      // Helper: execute a single node
      const executeNode = (node: WorkflowNode): unknown => {
        // Get inputs from connected nodes
        const inputs: Record<string, unknown> = {};
        const incomingConnections = workflow.connections.filter(
          (c) => c.targetNodeId === node.id
        );

        for (const conn of incomingConnections) {
          const sourceOutput = nodeOutputs.get(conn.sourceNodeId);
          inputs[conn.targetInput] = sourceOutput;
        }

        // Mock execution based on node type
        let result: unknown;

        if (node.type.startsWith('math.')) {
          // TypeScript math nodes
          if (node.type === 'math.add') {
            // Get input from previous node or config
            const inputValue = inputs.main;
            const a = Number(typeof inputValue === 'number' ? inputValue : node.config.a || 0);
            const b = Number(node.config.b || 0);
            result = a + b;
          } else if (node.type === 'math.multiply') {
            // Get input from previous node or config
            const inputValue = inputs.main;
            const a = Number(typeof inputValue === 'number' ? inputValue : node.config.a || 0);
            const b = Number(node.config.b || 0);
            result = a * b;
          } else if (node.type === 'math.subtract') {
            const inputValue = inputs.main;
            const a = Number(typeof inputValue === 'number' ? inputValue : node.config.a || 0);
            const b = Number(node.config.b || 0);
            result = a - b;
          } else {
            result = 0;
          }
        } else if (node.type.startsWith('data.')) {
          // Python data nodes
          if (node.type === 'data.filter') {
            // Get items from input or config
            const inputData = inputs.main as any;
            const items = Array.isArray(inputData?.items) ? inputData.items :
                         Array.isArray(inputData) ? inputData :
                         Array.isArray(node.config.items) ? node.config.items : [];
            // Simple filter for active items
            result = items.filter((item: any) => item.active === true);
          } else if (node.type === 'data.transform') {
            const inputData = inputs.main;
            const items = Array.isArray(inputData) ? inputData : [];
            result = items.map((item: any) => ({ ...item, processed: true }));
          } else if (node.type === 'data.count') {
            const inputData = inputs.main;
            const items = Array.isArray(inputData) ? inputData : [];
            result = items.length;
          } else {
            result = inputs;
          }
        } else if (node.type === 'trigger.manual') {
          // Manual trigger - pass through config
          result = node.config.initialData || { triggered: true };
        } else {
          // Generic passthrough
          result = inputs;
        }

        execution.nodeResults[node.id] = {
          status: 'success',
          output: result,
        };

        return result;
      };

      // Execute nodes in order (simplified - assumes linear flow)
      const sortedNodes = [...workflow.nodes].sort((a, b) => {
        // Triggers first
        if (a.type.startsWith('trigger.')) return -1;
        if (b.type.startsWith('trigger.')) return 1;
        return 0;
      });

      for (const node of sortedNodes) {
        try {
          const output = executeNode(node);
          nodeOutputs.set(node.id, output);
          executed.add(node.id);
        } catch (err) {
          execution.nodeResults[node.id] = {
            status: 'error',
            error: err instanceof Error ? err.message : 'Unknown error',
          };
          throw err;
        }
      }

      // Final output is the last node's output
      const lastNode = sortedNodes[sortedNodes.length - 1];
      execution.outputs = { result: nodeOutputs.get(lastNode.id) };
      execution.status = 'success';
      execution.endTime = new Date().toISOString();

      // Success notification
      const successNotif: Notification = {
        id: uuidv4(),
        type: 'success',
        title: 'Workflow Completed',
        message: `Workflow "${workflow.name}" completed successfully`,
        timestamp: execution.endTime,
        read: false,
        workflowId: workflow.id,
        executionId,
      };
      notifications.set(successNotif.id, successNotif);

      // Update user stats
      userStats.workflowsRun++;
      userStats.nodesCreated += workflow.nodes.length;
    } catch (err) {
      execution.status = 'error';
      execution.error = err instanceof Error ? err.message : 'Execution failed';
      execution.endTime = new Date().toISOString();

      // Error notification
      const errorNotif: Notification = {
        id: uuidv4(),
        type: 'error',
        title: 'Workflow Failed',
        message: `Workflow "${workflow.name}" failed: ${execution.error}`,
        timestamp: execution.endTime,
        read: false,
        workflowId: workflow.id,
        executionId,
      };
      notifications.set(errorNotif.id, errorNotif);

      userStats.failedRuns++;
    }

    executions.set(executionId, execution);
  }, 1000); // 1 second simulated execution

  return execution;
}

// =============================================================================
// EXPRESS APP
// =============================================================================

const app = express();
const PORT = process.env.MOCK_DBAL_PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

// =============================================================================
// HEALTH & STATS
// =============================================================================

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/stats', (req: Request, res: Response) => {
  res.json(userStats);
});

// =============================================================================
// WORKSPACES
// =============================================================================

// Multi-tenant workspace routes (v1 API)
app.get('/api/v1/:tenant/workspaces', (req: Request, res: Response) => {
  const { tenant } = req.params;
  const workspaceList = Array.from(workspaces.values()).filter(
    (w) => w.tenantId === tenant
  );
  res.json({ workspaces: workspaceList, total: workspaceList.length });
});

app.get('/api/v1/:tenant/workspaces/:id', (req: Request, res: Response) => {
  const { tenant, id } = req.params;
  const workspace = workspaces.get(id);

  if (!workspace || workspace.tenantId !== tenant) {
    return res.status(404).json({ error: 'Workspace not found' });
  }

  res.json(workspace);
});

app.post('/api/v1/:tenant/workspaces', (req: Request, res: Response) => {
  const { tenant } = req.params;
  const { name, description, color, icon } = req.body;

  const workspace: Workspace = {
    id: uuidv4(),
    name: name || 'New Workspace',
    description: description || '',
    color: color || '#6750A4',
    icon: icon || '📁',
    tenantId: tenant,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    workflowCount: 0,
  };

  workspaces.set(workspace.id, workspace);

  // Create notification
  const notification: Notification = {
    id: uuidv4(),
    type: 'success',
    title: 'Workspace Created',
    message: `Created workspace "${workspace.name}"`,
    timestamp: workspace.createdAt,
    read: false,
  };
  notifications.set(notification.id, notification);

  res.status(201).json(workspace);
});

app.put('/api/v1/:tenant/workspaces/:id', (req: Request, res: Response) => {
  const { tenant, id } = req.params;
  const { name, description, color, icon } = req.body;
  const workspace = workspaces.get(id);

  if (!workspace || workspace.tenantId !== tenant) {
    return res.status(404).json({ error: 'Workspace not found' });
  }

  const updated: Workspace = {
    ...workspace,
    name: name || workspace.name,
    description: description !== undefined ? description : workspace.description,
    color: color || workspace.color,
    icon: icon || workspace.icon,
    updatedAt: new Date().toISOString(),
  };

  workspaces.set(id, updated);
  res.json(updated);
});

app.delete('/api/v1/:tenant/workspaces/:id', (req: Request, res: Response) => {
  const { tenant, id } = req.params;
  const workspace = workspaces.get(id);

  if (!workspace || workspace.tenantId !== tenant) {
    return res.status(404).json({ error: 'Workspace not found' });
  }

  // Delete all workflows in this workspace
  const workflowsInWorkspace = Array.from(workflows.values())
    .filter(w => w.workspaceId === id);
  workflowsInWorkspace.forEach(w => workflows.delete(w.id));

  workspaces.delete(id);
  res.status(204).send();
});

// Legacy non-versioned workspace routes (for backward compatibility)
app.get('/api/workspaces', (req: Request, res: Response) => {
  const { tenantId } = req.query;
  const workspaceList = Array.from(workspaces.values()).filter(
    (w) => !tenantId || w.tenantId === tenantId
  );
  res.json({ workspaces: workspaceList, total: workspaceList.length });
});

app.get('/api/workspaces/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const workspace = workspaces.get(id);

  if (!workspace) {
    return res.status(404).json({ error: 'Workspace not found' });
  }

  res.json(workspace);
});

app.post('/api/workspaces', (req: Request, res: Response) => {
  const { name, description, color, icon, tenantId } = req.body;

  const workspace: Workspace = {
    id: uuidv4(),
    name: name || 'New Workspace',
    description: description || '',
    color: color || '#6750A4',
    icon: icon || '📁',
    tenantId: tenantId || 'test-tenant',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    workflowCount: 0,
  };

  workspaces.set(workspace.id, workspace);

  // Create notification
  const notification: Notification = {
    id: uuidv4(),
    type: 'success',
    title: 'Workspace Created',
    message: `Created workspace "${workspace.name}"`,
    timestamp: workspace.createdAt,
    read: false,
  };
  notifications.set(notification.id, notification);

  res.status(201).json(workspace);
});

app.put('/api/workspaces/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const workspace = workspaces.get(id);

  if (!workspace) {
    return res.status(404).json({ error: 'Workspace not found' });
  }

  const updated: Workspace = {
    ...workspace,
    ...req.body,
    id, // Preserve ID
    updatedAt: new Date().toISOString(),
  };

  workspaces.set(id, updated);
  res.json(updated);
});

app.delete('/api/workspaces/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const workspace = workspaces.get(id);

  if (!workspace) {
    return res.status(404).json({ error: 'Workspace not found' });
  }

  workspaces.delete(id);

  // Delete associated workflows
  const workflowsToDelete = Array.from(workflows.values()).filter(
    (w) => w.workspaceId === id
  );
  workflowsToDelete.forEach((w) => workflows.delete(w.id));

  res.status(204).send();
});

// =============================================================================
// WORKFLOWS
// =============================================================================

// List workflows
app.get('/api/v1/:tenant/workflows', (req: Request, res: Response) => {
  const { tenant } = req.params;
  const { workspaceId } = req.query;

  let workflowList = Array.from(workflows.values()).filter((w) => w.tenantId === tenant);

  if (workspaceId) {
    workflowList = workflowList.filter((w) => w.workspaceId === workspaceId);
  }

  res.json({ workflows: workflowList, total: workflowList.length });
});

// Get workflow
app.get('/api/v1/:tenant/workflows/:id', (req: Request, res: Response) => {
  const { tenant, id } = req.params;
  const workflow = workflows.get(id);

  if (!workflow || workflow.tenantId !== tenant) {
    return res.status(404).json({ error: 'Workflow not found' });
  }

  res.json(workflow);
});

// Create workflow
app.post('/api/v1/:tenant/workflows', (req: Request, res: Response) => {
  const { tenant } = req.params;
  const workflowData = req.body;

  const workflow: Workflow = {
    id: workflowData.id || uuidv4(),
    name: workflowData.name || 'Untitled Workflow',
    description: workflowData.description || '',
    nodes: workflowData.nodes || [],
    connections: workflowData.connections || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tenantId: tenant,
    workspaceId: workflowData.workspaceId,
    status: workflowData.status || 'draft',
  };

  workflows.set(workflow.id, workflow);

  // Update workspace workflow count
  if (workflow.workspaceId) {
    const workspace = workspaces.get(workflow.workspaceId);
    if (workspace) {
      workspace.workflowCount++;
      workspace.lastActivity = workflow.createdAt;
      workspaces.set(workspace.id, workspace);
    }
  }

  // Create notification
  const notification: Notification = {
    id: uuidv4(),
    type: 'success',
    title: 'Workflow Created',
    message: `Created workflow "${workflow.name}"`,
    timestamp: workflow.createdAt,
    read: false,
    workflowId: workflow.id,
  };
  notifications.set(notification.id, notification);

  res.status(201).json(workflow);
});

// Update workflow
app.put('/api/v1/:tenant/workflows/:id', (req: Request, res: Response) => {
  const { tenant, id } = req.params;
  const workflow = workflows.get(id);

  if (!workflow || workflow.tenantId !== tenant) {
    return res.status(404).json({ error: 'Workflow not found' });
  }

  const updated: Workflow = {
    ...workflow,
    ...req.body,
    id, // Preserve ID
    tenantId: tenant, // Preserve tenant
    updatedAt: new Date().toISOString(),
  };

  workflows.set(id, updated);
  res.json(updated);
});

// Delete workflow
app.delete('/api/v1/:tenant/workflows/:id', (req: Request, res: Response) => {
  const { tenant, id } = req.params;
  const workflow = workflows.get(id);

  if (!workflow || workflow.tenantId !== tenant) {
    return res.status(404).json({ error: 'Workflow not found' });
  }

  workflows.delete(id);

  // Update workspace workflow count
  if (workflow.workspaceId) {
    const workspace = workspaces.get(workflow.workspaceId);
    if (workspace) {
      workspace.workflowCount = Math.max(0, workspace.workflowCount - 1);
      workspaces.set(workspace.id, workspace);
    }
  }

  res.status(204).send();
});

// Execute workflow
app.post('/api/v1/:tenant/workflows/:id/execute', async (req: Request, res: Response) => {
  const { tenant, id } = req.params;
  const workflow = workflows.get(id);

  if (!workflow || workflow.tenantId !== tenant) {
    return res.status(404).json({ error: 'Workflow not found' });
  }

  const execution = await executeWorkflow(workflow);
  res.status(202).json(execution);
});

// Get execution status
app.get('/api/v1/:tenant/executions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const execution = executions.get(id);

  if (!execution) {
    return res.status(404).json({ error: 'Execution not found' });
  }

  res.json(execution);
});

// List executions for workflow
app.get('/api/v1/:tenant/workflows/:workflowId/executions', (req: Request, res: Response) => {
  const { workflowId } = req.params;
  const executionList = Array.from(executions.values()).filter(
    (e) => e.workflowId === workflowId
  );
  res.json({ executions: executionList, total: executionList.length });
});

// =============================================================================
// NOTIFICATIONS
// =============================================================================

app.get('/api/notifications', (req: Request, res: Response) => {
  const { unreadOnly, limit = 50 } = req.query;

  let notificationList = Array.from(notifications.values())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (unreadOnly === 'true') {
    notificationList = notificationList.filter((n) => !n.read);
  }

  if (limit) {
    notificationList = notificationList.slice(0, Number(limit));
  }

  res.json({
    notifications: notificationList,
    total: notificationList.length,
    unreadCount: Array.from(notifications.values()).filter((n) => !n.read).length,
  });
});

app.put('/api/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const notification = notifications.get(id);

  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  notification.read = true;
  notifications.set(id, notification);
  res.json(notification);
});

app.post('/api/notifications/mark-all-read', (req: Request, res: Response) => {
  Array.from(notifications.values()).forEach((n) => {
    n.read = true;
    notifications.set(n.id, n);
  });
  res.json({ success: true });
});

// =============================================================================
// SEED DATA
// =============================================================================

function seedData() {
  const tenant = 'test-tenant';
  const now = new Date().toISOString();

  console.log('🌱 Seeding mock DBAL with comprehensive data...\n');

  // Create 3 workspaces
  const workspaceData = [
    { name: 'Personal Projects', description: 'My personal automation workflows', color: '#6750A4', icon: '👤' },
    { name: 'Team Alpha', description: 'Collaborative team workflows', color: '#006E1C', icon: '👥' },
    { name: 'Data Processing', description: 'ETL and data transformation pipelines', color: '#00639B', icon: '📊' },
  ];

  const createdWorkspaces: Workspace[] = [];
  workspaceData.forEach((data) => {
    const workspace: Workspace = {
      id: uuidv4(),
      ...data,
      tenantId: tenant,
      createdAt: now,
      updatedAt: now,
      workflowCount: 0,
      lastActivity: now,
    };
    workspaces.set(workspace.id, workspace);
    createdWorkspaces.push(workspace);
    console.log(`  ✓ Workspace: ${workspace.name} (${workspace.id})`);
  });

  // Create 5 workflows across workspaces
  const workflowData = [
    {
      name: 'Daily Report Generator',
      description: 'Generates daily analytics reports',
      workspaceId: createdWorkspaces[0].id,
      nodes: [
        {
          id: 'trigger-1',
          type: 'trigger.manual',
          name: 'Start',
          position: { x: 100, y: 100 },
          config: { initialData: { date: now } },
          inputs: [],
          outputs: ['main'],
        },
        {
          id: 'process-1',
          type: 'data.transform',
          name: 'Format Report',
          position: { x: 300, y: 100 },
          config: {},
          inputs: ['main'],
          outputs: ['main'],
        },
      ],
      connections: [
        {
          id: 'conn-1',
          sourceNodeId: 'trigger-1',
          sourceOutput: 'main',
          targetNodeId: 'process-1',
          targetInput: 'main',
        },
      ],
    },
    {
      name: 'Customer Data Sync',
      description: 'Syncs customer data from CRM to database',
      workspaceId: createdWorkspaces[1].id,
      nodes: [
        {
          id: 'trigger-2',
          type: 'trigger.manual',
          name: 'Trigger',
          position: { x: 100, y: 100 },
          config: {},
          inputs: [],
          outputs: ['main'],
        },
      ],
      connections: [],
    },
    {
      name: 'Image Batch Processor',
      description: 'Processes and optimizes uploaded images',
      workspaceId: createdWorkspaces[0].id,
      nodes: [],
      connections: [],
    },
    {
      name: 'Email Campaign Automation',
      description: 'Sends personalized email campaigns',
      workspaceId: createdWorkspaces[1].id,
      nodes: [],
      connections: [],
    },
    {
      name: 'ETL Pipeline - Analytics',
      description: 'Extract, transform, load analytics data',
      workspaceId: createdWorkspaces[2].id,
      nodes: [
        {
          id: 'extract-1',
          type: 'data.filter',
          name: 'Extract Data',
          position: { x: 100, y: 100 },
          config: { items: [] },
          inputs: [],
          outputs: ['main'],
        },
        {
          id: 'transform-1',
          type: 'data.transform',
          name: 'Transform',
          position: { x: 300, y: 100 },
          config: {},
          inputs: ['main'],
          outputs: ['main'],
        },
        {
          id: 'count-1',
          type: 'data.count',
          name: 'Count Records',
          position: { x: 500, y: 100 },
          config: {},
          inputs: ['main'],
          outputs: ['main'],
        },
      ],
      connections: [
        {
          id: 'conn-1',
          sourceNodeId: 'extract-1',
          sourceOutput: 'main',
          targetNodeId: 'transform-1',
          targetInput: 'main',
        },
        {
          id: 'conn-2',
          sourceNodeId: 'transform-1',
          sourceOutput: 'main',
          targetNodeId: 'count-1',
          targetInput: 'main',
        },
      ],
    },
  ];

  workflowData.forEach((data) => {
    const workflow: Workflow = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      nodes: data.nodes,
      connections: data.connections,
      createdAt: now,
      updatedAt: now,
      tenantId: tenant,
      workspaceId: data.workspaceId,
      status: 'active',
    };
    workflows.set(workflow.id, workflow);

    // Update workspace count
    const workspace = workspaces.get(workflow.workspaceId!);
    if (workspace) {
      workspace.workflowCount++;
      workspaces.set(workspace.id, workspace);
    }

    console.log(`  ✓ Workflow: ${workflow.name} (${workflow.id})`);
  });

  // Create sample notifications
  const notificationData = [
    { type: 'success', title: 'Welcome!', message: 'Your workspace is ready to use' },
    { type: 'info', title: 'New Feature', message: 'Python nodes are now available' },
    { type: 'warning', title: 'Maintenance', message: 'Scheduled maintenance tomorrow at 2 AM' },
  ];

  notificationData.forEach((data) => {
    const notification: Notification = {
      id: uuidv4(),
      type: data.type as any,
      title: data.title,
      message: data.message,
      timestamp: now,
      read: false,
    };
    notifications.set(notification.id, notification);
    console.log(`  ✓ Notification: ${notification.title}`);
  });

  console.log('\n✅ Seed data created:');
  console.log(`   - ${workspaces.size} workspaces`);
  console.log(`   - ${workflows.size} workflows`);
  console.log(`   - ${notifications.size} notifications`);
  console.log('');
}

// =============================================================================
// SERVER START
// =============================================================================

app.listen(PORT, () => {
  console.log(`🚀 Mock DBAL Server running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Stats: http://localhost:${PORT}/api/stats`);
  console.log(`   Workspaces: http://localhost:${PORT}/api/workspaces`);
  console.log(`   Workflows: http://localhost:${PORT}/api/v1/:tenant/workflows`);
  console.log(`   Notifications: http://localhost:${PORT}/api/notifications`);
  console.log('');
  seedData();
});

export default app;
