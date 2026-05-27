/**
 * Tests for workflowStateUtils
 */

import {
  defaultWorkflow,
  buildSavePayload,
} from '../workflowStateUtils';

describe('defaultWorkflow', () => {
  it('returns a workflow object with the provided id', () => {
    const wf = defaultWorkflow('test-id');
    expect(wf.id).toBe('test-id');
  });

  it('falls back to "new" when id is empty', () => {
    const wf = defaultWorkflow('');
    expect(wf.id).toBe('new');
  });

  it('starts with a single trigger node', () => {
    const wf = defaultWorkflow('wf-1');
    expect(wf.nodes).toHaveLength(1);
    expect(wf.nodes[0].type).toBe('trigger.manual');
  });

  it('starts with no connections', () => {
    const wf = defaultWorkflow('wf-1');
    expect(wf.connections).toHaveLength(0);
  });

  it('includes createdAt and updatedAt ISO strings', () => {
    const before = Date.now();
    const wf = defaultWorkflow('wf-1');
    const after = Date.now();
    const createdAt = new Date(wf.createdAt).getTime();
    expect(createdAt).toBeGreaterThanOrEqual(before);
    expect(createdAt).toBeLessThanOrEqual(after);
    expect(typeof wf.updatedAt).toBe('string');
  });
});

describe('buildSavePayload', () => {
  const mockWorkflow = {
    id: 'wf-1',
    name: 'My Workflow',
    description: 'A test workflow',
    nodes: [
      {
        id: 'node_1',
        type: 'trigger.manual',
        name: 'Start',
        position: { x: 100, y: 200 },
        config: {},
        inputs: [],
        outputs: ['main'],
      },
    ],
    connections: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  it('includes the workflow name', () => {
    const payload = buildSavePayload(mockWorkflow);
    expect(payload.name).toBe('My Workflow');
  });

  it('includes the workflow description', () => {
    const payload = buildSavePayload(mockWorkflow);
    expect(payload.description).toBe('A test workflow');
  });

  it('sets version to 1.0.0', () => {
    const payload = buildSavePayload(mockWorkflow);
    expect(payload.version).toBe('1.0.0');
  });

  it('sets category to custom', () => {
    const payload = buildSavePayload(mockWorkflow);
    expect(payload.category).toBe('custom');
  });

  it('sets status to draft', () => {
    const payload = buildSavePayload(mockWorkflow);
    expect(payload.status).toBe('draft');
  });

  it('includes the nodes array', () => {
    const payload = buildSavePayload(mockWorkflow);
    expect(payload.nodes).toBe(mockWorkflow.nodes);
  });

  it('has empty connections object', () => {
    const payload = buildSavePayload(mockWorkflow);
    expect(payload.connections).toEqual({});
  });

  it('has empty metadata object', () => {
    const payload = buildSavePayload(mockWorkflow);
    expect(payload.metadata).toEqual({});
  });
});
