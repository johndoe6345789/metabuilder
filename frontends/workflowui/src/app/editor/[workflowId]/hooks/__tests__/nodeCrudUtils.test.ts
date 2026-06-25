/**
 * Tests for nodeCrudUtils – pure workflow node mutation helpers
 */

import {
  updateNodeConfig,
  updateNodeName,
  deleteNode,
} from '../nodeCrudUtils';

// Build a minimal workflow matching what nodeCrudUtils expects
function makeWorkflow(extraNodes = []) {
  return {
    id: 'wf-1',
    name: 'Test',
    description: '',
    nodes: [
      {
        id: 'node_1',
        type: 'trigger.manual',
        name: 'Start',
        position: { x: 0, y: 0 },
        config: {},
        inputs: [],
        outputs: ['main'],
      },
      {
        id: 'node_2',
        type: 'action.http',
        name: 'HTTP Request',
        position: { x: 200, y: 0 },
        config: { url: 'https://api.example.com' },
        inputs: ['main'],
        outputs: ['main'],
      },
      ...extraNodes,
    ],
    connections: [
      {
        id: 'conn_1',
        sourceNodeId: 'node_1',
        targetNodeId: 'node_2',
        sourceOutput: 'main',
        targetInput: 'main',
      },
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };
}

describe('updateNodeConfig', () => {
  it('calls setWorkflow with updated config for the target node', () => {
    const workflow = makeWorkflow();
    const setWorkflow = jest.fn();
    const newConfig = { url: 'https://updated.com', method: 'POST' };

    updateNodeConfig(setWorkflow, 'node_2', newConfig);

    const updater = setWorkflow.mock.calls[0][0];
    const next = updater(workflow);

    expect(next.nodes.find((n) => n.id === 'node_2').config).toEqual(
      newConfig
    );
  });

  it('does not modify other nodes', () => {
    const workflow = makeWorkflow();
    const setWorkflow = jest.fn();

    updateNodeConfig(setWorkflow, 'node_2', { foo: 'bar' });

    const updater = setWorkflow.mock.calls[0][0];
    const next = updater(workflow);
    expect(next.nodes.find((n) => n.id === 'node_1').config).toEqual({});
  });

  it('stamps updatedAt on the returned workflow', () => {
    const workflow = makeWorkflow();
    const setWorkflow = jest.fn();
    const before = Date.now();

    updateNodeConfig(setWorkflow, 'node_1', {});

    const updater = setWorkflow.mock.calls[0][0];
    const next = updater(workflow);
    expect(new Date(next.updatedAt).getTime()).toBeGreaterThanOrEqual(before);
  });
});

describe('updateNodeName', () => {
  it('updates the name of the target node', () => {
    const workflow = makeWorkflow();
    const setWorkflow = jest.fn();

    updateNodeName(setWorkflow, 'node_1', 'Trigger Start');

    const updater = setWorkflow.mock.calls[0][0];
    const next = updater(workflow);
    expect(next.nodes.find((n) => n.id === 'node_1').name).toBe(
      'Trigger Start'
    );
  });

  it('does not change names of other nodes', () => {
    const workflow = makeWorkflow();
    const setWorkflow = jest.fn();

    updateNodeName(setWorkflow, 'node_1', 'New Name');

    const updater = setWorkflow.mock.calls[0][0];
    const next = updater(workflow);
    expect(next.nodes.find((n) => n.id === 'node_2').name).toBe(
      'HTTP Request'
    );
  });

  it('stamps updatedAt', () => {
    const workflow = makeWorkflow();
    const setWorkflow = jest.fn();
    const before = Date.now();

    updateNodeName(setWorkflow, 'node_1', 'X');

    const updater = setWorkflow.mock.calls[0][0];
    const next = updater(workflow);
    expect(new Date(next.updatedAt).getTime()).toBeGreaterThanOrEqual(before);
  });
});

describe('deleteNode', () => {
  it('removes the target node from the nodes array', () => {
    const workflow = makeWorkflow();
    const setWorkflow = jest.fn();
    const setSelectedNodeId = jest.fn();

    deleteNode(setWorkflow, 'node_2', setSelectedNodeId);

    const updater = setWorkflow.mock.calls[0][0];
    const next = updater(workflow);
    expect(next.nodes.find((n) => n.id === 'node_2')).toBeUndefined();
    expect(next.nodes).toHaveLength(1);
  });

  it('removes connections referencing the deleted node', () => {
    const workflow = makeWorkflow();
    const setWorkflow = jest.fn();
    const setSelectedNodeId = jest.fn();

    deleteNode(setWorkflow, 'node_2', setSelectedNodeId);

    const updater = setWorkflow.mock.calls[0][0];
    const next = updater(workflow);
    expect(next.connections).toHaveLength(0);
  });

  it('keeps connections unrelated to the deleted node', () => {
    const workflow = makeWorkflow([
      {
        id: 'node_3',
        type: 'action.log',
        name: 'Logger',
        position: { x: 400, y: 0 },
        config: {},
        inputs: ['main'],
        outputs: [],
      },
    ]);
    // Add an unrelated connection between node_2 and node_3
    workflow.connections.push({
      id: 'conn_2',
      sourceNodeId: 'node_2',
      targetNodeId: 'node_3',
      sourceOutput: 'main',
      targetInput: 'main',
    });

    const setWorkflow = jest.fn();
    const setSelectedNodeId = jest.fn();

    // Delete node_1 (only conn_1 references it as source)
    deleteNode(setWorkflow, 'node_1', setSelectedNodeId);

    const updater = setWorkflow.mock.calls[0][0];
    const next = updater(workflow);
    // conn_2 (node_2→node_3) should survive
    expect(next.connections.find((c) => c.id === 'conn_2')).toBeDefined();
  });

  it('calls setSelectedNodeId(null) after deletion', () => {
    const workflow = makeWorkflow();
    const setWorkflow = jest.fn();
    const setSelectedNodeId = jest.fn();

    deleteNode(setWorkflow, 'node_1', setSelectedNodeId);

    // setSelectedNodeId is called synchronously after setWorkflow
    expect(setSelectedNodeId).toHaveBeenCalledWith(null);
  });

  it('stamps updatedAt', () => {
    const workflow = makeWorkflow();
    const setWorkflow = jest.fn();
    const before = Date.now();

    deleteNode(setWorkflow, 'node_2', jest.fn());

    const updater = setWorkflow.mock.calls[0][0];
    const next = updater(workflow);
    expect(new Date(next.updatedAt).getTime()).toBeGreaterThanOrEqual(before);
  });
});
