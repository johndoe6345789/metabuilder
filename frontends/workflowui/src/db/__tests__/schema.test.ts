/**
 * Tests for IndexedDB schema operations (Dexie-based)
 * Mocks Dexie to avoid real IndexedDB in jsdom
 */

function createMockTable() {
  const tableObj: any = {
    where: jest.fn().mockReturnThis(),
    equals: jest.fn().mockReturnThis(),
    toArray: jest.fn().mockResolvedValue([]),
    get: jest.fn().mockResolvedValue(undefined),
    add: jest.fn().mockResolvedValue('mock-id'),
    put: jest.fn().mockResolvedValue('mock-id'),
    delete: jest.fn().mockResolvedValue(undefined),
    bulkPut: jest.fn().mockResolvedValue(undefined),
    reverse: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    first: jest.fn().mockResolvedValue(undefined),
    count: jest.fn().mockResolvedValue(0),
    below: jest.fn().mockReturnThis(),
    update: jest.fn().mockResolvedValue(1),
  }
  return tableObj
}

jest.mock('dexie', () => {
  class MockDexie {
    workflows = createMockTable()
    executions = createMockTable()
    nodeTypes = createMockTable()
    drafts = createMockTable()
    syncQueue = createMockTable()
    workspaces = createMockTable()
    projects = createMockTable()
    projectCanvasItems = createMockTable()

    version(_v: number) {
      return { stores: jest.fn().mockReturnThis() }
    }
  }

  const DexieMock = MockDexie as any
  DexieMock.default = MockDexie
  return DexieMock
})

import {
  workflowDB,
  executionDB,
  nodeTypeDB,
  syncQueueDB,
  workspaceDB,
  projectDB,
  projectCanvasItemDB,
  WorkflowDB,
  db,
} from '../schema'

const makeWorkflow = (id = 'wf-1', tenantId = 'tenant-1') => ({
  id,
  name: 'Test Workflow',
  version: '1.0.0',
  tenantId,
  nodes: [],
  connections: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

const makeExecution = (id = 'exec-1') => ({
  id,
  workflowId: 'wf-1',
  workflowName: 'Test',
  tenantId: 'tenant-1',
  status: 'success' as const,
  startTime: Date.now(),
  duration: 1000,
  nodes: [],
})

const makeWorkspace = (id = 'ws-1') => ({
  id,
  name: 'My Workspace',
  tenantId: 'tenant-1',
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

const makeProject = (id = 'proj-1') => ({
  id,
  name: 'My Project',
  workspaceId: 'ws-1',
  tenantId: 'tenant-1',
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

const makeCanvasItem = (id = 'item-1') => ({
  id,
  projectId: 'proj-1',
  workflowId: 'wf-1',
  position: { x: 100, y: 200 },
  size: { width: 200, height: 150 },
  zIndex: 1,
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

describe('WorkflowDB', () => {
  it('should create a WorkflowDB instance', () => {
    expect(db).toBeDefined()
  })

  it('should have workflow table', () => {
    expect(db.workflows).toBeDefined()
  })

  it('should have executions table', () => {
    expect(db.executions).toBeDefined()
  })
})

describe('workflowDB', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('getByTenant returns workflows', async () => {
    const result = await workflowDB.getByTenant('tenant-1')
    expect(Array.isArray(result)).toBe(true)
  })

  it('get returns a workflow by id', async () => {
    await workflowDB.get('wf-1')
    expect(db.workflows.get).toHaveBeenCalledWith('wf-1')
  })

  it('create adds workflow and returns id', async () => {
    const wf = makeWorkflow()
    const id = await workflowDB.create(wf)
    expect(db.workflows.add).toHaveBeenCalledWith(wf)
    expect(id).toBeDefined()
  })

  it('update saves workflow', async () => {
    const wf = makeWorkflow()
    await workflowDB.update(wf)
    expect(db.workflows.put).toHaveBeenCalledWith(wf)
  })

  it('delete removes workflow by id', async () => {
    await workflowDB.delete('wf-1', 'tenant-1')
    expect(db.workflows.delete).toHaveBeenCalledWith('wf-1')
  })

  it('search filters workflows by query', async () => {
    db.workflows.toArray = jest.fn().mockResolvedValue([
      makeWorkflow('wf-1'),
      { ...makeWorkflow('wf-2'), name: 'Other Workflow' },
    ])
    const results = await workflowDB.search('tenant-1', 'Test')
    expect(results.length).toBeGreaterThan(0)
  })

  it('getDraft returns draft by id', async () => {
    await workflowDB.getDraft('wf-1')
    expect(db.drafts.get).toHaveBeenCalledWith('wf-1')
  })

  it('saveDraft saves draft', async () => {
    const draft = { id: 'wf-1', name: 'Draft' }
    await workflowDB.saveDraft('wf-1', draft)
    expect(db.drafts.put).toHaveBeenCalledWith({ ...draft, id: 'wf-1' })
  })

  it('clearDraft deletes draft', async () => {
    await workflowDB.clearDraft('wf-1')
    expect(db.drafts.delete).toHaveBeenCalledWith('wf-1')
  })
})

describe('executionDB', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('getByWorkflow returns executions', async () => {
    const results = await executionDB.getByWorkflow('wf-1')
    expect(Array.isArray(results)).toBe(true)
  })

  it('get returns execution by id', async () => {
    await executionDB.get('exec-1')
    expect(db.executions.get).toHaveBeenCalledWith('exec-1')
  })

  it('create adds execution', async () => {
    const exec = makeExecution()
    const id = await executionDB.create(exec)
    expect(db.executions.add).toHaveBeenCalledWith(exec)
    expect(id).toBeDefined()
  })

  it('update saves execution', async () => {
    const exec = makeExecution()
    await executionDB.update(exec)
    expect(db.executions.put).toHaveBeenCalledWith(exec)
  })

  it('countByWorkflow returns count', async () => {
    const count = await executionDB.countByWorkflow('wf-1')
    expect(typeof count).toBe('number')
  })

  it('getAverageTime returns 0 for empty', async () => {
    db.executions.toArray = jest.fn().mockResolvedValue([])
    const avg = await executionDB.getAverageTime('wf-1')
    expect(avg).toBe(0)
  })

  it('getAverageTime computes average for non-empty', async () => {
    db.executions.toArray = jest.fn().mockResolvedValue([
      { ...makeExecution(), duration: 1000 },
      { ...makeExecution('exec-2'), duration: 2000 },
    ])
    const avg = await executionDB.getAverageTime('wf-1')
    expect(avg).toBe(1500)
  })

  it('clearOlderThan removes old executions', async () => {
    await executionDB.clearOlderThan(30)
    expect(db.executions.delete).toHaveBeenCalled()
  })
})

describe('nodeTypeDB', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('getByTenant returns node types', async () => {
    const results = await nodeTypeDB.getByTenant('tenant-1')
    expect(Array.isArray(results)).toBe(true)
  })

  it('getByCategory returns node types by category', async () => {
    const results = await nodeTypeDB.getByCategory('tenant-1', 'network')
    expect(Array.isArray(results)).toBe(true)
  })

  it('cache stores node types', async () => {
    const types = [{ id: 'http', name: 'HTTP', category: 'network', version: '1.0', parameters: {} }]
    await nodeTypeDB.cache('tenant-1', types)
    expect(db.nodeTypes.bulkPut).toHaveBeenCalled()
  })

  it('clearCache deletes node types for tenant', async () => {
    await nodeTypeDB.clearCache('tenant-1')
    expect(db.nodeTypes.delete).toHaveBeenCalled()
  })
})

describe('syncQueueDB', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    db.syncQueue.add = jest.fn().mockResolvedValue(1)
    db.syncQueue.get = jest.fn().mockResolvedValue({
      id: 1, tenantId: 'tenant-1', action: 'create', entity: 'workflow',
      entityId: 'wf-1', timestamp: Date.now(), retries: 0
    })
  })

  it('add creates sync queue item', async () => {
    const id = await syncQueueDB.add({
      tenantId: 'tenant-1',
      action: 'create',
      entity: 'workflow',
      entityId: 'wf-1',
    })
    expect(id).toBe(1)
  })

  it('getPending returns items', async () => {
    const items = await syncQueueDB.getPending('tenant-1')
    expect(Array.isArray(items)).toBe(true)
  })

  it('markSynced deletes item', async () => {
    await syncQueueDB.markSynced(1)
    expect(db.syncQueue.delete).toHaveBeenCalledWith(1)
  })

  it('incrementRetry updates item', async () => {
    await syncQueueDB.incrementRetry(1, 'Network error')
    expect(db.syncQueue.update).toHaveBeenCalledWith(1, expect.objectContaining({
      retries: 1,
      lastError: 'Network error',
    }))
  })

  it('clearOlderThan removes old items', async () => {
    await syncQueueDB.clearOlderThan(30)
    expect(db.syncQueue.delete).toHaveBeenCalled()
  })
})

describe('workspaceDB', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('getByTenant returns workspaces', async () => {
    const results = await workspaceDB.getByTenant('tenant-1')
    expect(Array.isArray(results)).toBe(true)
  })

  it('get returns workspace by id', async () => {
    await workspaceDB.get('ws-1')
    expect(db.workspaces.get).toHaveBeenCalledWith('ws-1')
  })

  it('create adds workspace', async () => {
    const ws = makeWorkspace()
    await workspaceDB.create(ws)
    expect(db.workspaces.add).toHaveBeenCalledWith(ws)
  })

  it('update saves workspace', async () => {
    const ws = makeWorkspace()
    await workspaceDB.update(ws)
    expect(db.workspaces.put).toHaveBeenCalledWith(ws)
  })

  it('delete removes workspace', async () => {
    await workspaceDB.delete('ws-1')
    expect(db.workspaces.delete).toHaveBeenCalledWith('ws-1')
  })
})

describe('projectDB', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('getByWorkspace returns projects', async () => {
    const results = await projectDB.getByWorkspace('ws-1')
    expect(Array.isArray(results)).toBe(true)
  })

  it('getByTenant returns projects', async () => {
    const results = await projectDB.getByTenant('tenant-1')
    expect(Array.isArray(results)).toBe(true)
  })

  it('get returns project by id', async () => {
    await projectDB.get('proj-1')
    expect(db.projects.get).toHaveBeenCalledWith('proj-1')
  })

  it('create adds project', async () => {
    const proj = makeProject()
    await projectDB.create(proj)
    expect(db.projects.add).toHaveBeenCalledWith(proj)
  })

  it('update saves project', async () => {
    const proj = makeProject()
    await projectDB.update(proj)
    expect(db.projects.put).toHaveBeenCalledWith(proj)
  })

  it('delete removes project', async () => {
    await projectDB.delete('proj-1')
    expect(db.projects.delete).toHaveBeenCalledWith('proj-1')
  })

  it('getStarred filters starred projects', async () => {
    db.projects.filter = jest.fn().mockReturnThis()
    db.projects.toArray = jest.fn().mockResolvedValue([
      { ...makeProject(), starred: true },
      { ...makeProject('proj-2'), starred: false },
    ])
    const results = await projectDB.getStarred('tenant-1')
    expect(Array.isArray(results)).toBe(true)
  })
})

describe('projectCanvasItemDB', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('getByProject returns canvas items', async () => {
    const results = await projectCanvasItemDB.getByProject('proj-1')
    expect(Array.isArray(results)).toBe(true)
  })

  it('get returns item by id', async () => {
    await projectCanvasItemDB.get('item-1')
    expect(db.projectCanvasItems.get).toHaveBeenCalledWith('item-1')
  })

  it('create adds canvas item', async () => {
    const item = makeCanvasItem()
    await projectCanvasItemDB.create(item)
    expect(db.projectCanvasItems.add).toHaveBeenCalledWith(item)
  })

  it('update saves canvas item', async () => {
    const item = makeCanvasItem()
    await projectCanvasItemDB.update(item)
    expect(db.projectCanvasItems.put).toHaveBeenCalledWith(item)
  })

  it('delete removes canvas item', async () => {
    await projectCanvasItemDB.delete('item-1')
    expect(db.projectCanvasItems.delete).toHaveBeenCalledWith('item-1')
  })

  it('bulkUpdate saves multiple items', async () => {
    const items = [makeCanvasItem('item-1'), makeCanvasItem('item-2')]
    await projectCanvasItemDB.bulkUpdate(items)
    expect(db.projectCanvasItems.bulkPut).toHaveBeenCalledWith(items)
  })

  it('getByWorkflow returns item for project+workflow', async () => {
    const result = await projectCanvasItemDB.getByWorkflow('proj-1', 'wf-1')
    expect(db.projectCanvasItems.first).toHaveBeenCalled()
  })

  it('deleteByProject removes all items for project', async () => {
    await projectCanvasItemDB.deleteByProject('proj-1')
    expect(db.projectCanvasItems.delete).toHaveBeenCalled()
  })
})
