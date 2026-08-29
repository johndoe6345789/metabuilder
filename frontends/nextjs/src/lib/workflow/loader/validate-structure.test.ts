import { describe, expect, it } from 'vitest'

import {
  validateAll,
  validateConnections,
  validateMultiTenant,
  validateNodes,
  validateWorkflowStructure,
} from './validate-structure'

const node = (id: string, name = id) => ({
  id,
  name,
  nodeType: 'action',
})

const workflow = (over: Record<string, unknown> = {}) =>
  ({
    id: 'wf1',
    tenantId: 'acme',
    nodes: [node('n1')],
    connections: {},
    variables: {},
    triggers: [],
    ...over,
  }) as never

describe('validateWorkflowStructure', () => {
  it('accepts a workflow with one node', () => {
    expect(() => {
      validateWorkflowStructure(workflow())
    }).not.toThrow()
  })

  it.each([undefined, null, {}, 'nodes'])(
    'refuses %p in place of a nodes array',
    nodes => {
      expect(() => {
        validateWorkflowStructure(workflow({ nodes }))
      }).toThrow('must have nodes array')
    }
  )

  it('refuses a workflow with no nodes at all', () => {
    expect(() => {
      validateWorkflowStructure(workflow({ nodes: [] }))
    }).toThrow('at least one node')
  })

  it('refuses a missing connections object', () => {
    expect(() => {
      validateWorkflowStructure(workflow({ connections: 'none' }))
    }).toThrow('must have connections object')
  })
})

describe('validateNodes', () => {
  it('accepts distinct, complete nodes', () => {
    expect(() => {
      validateNodes(workflow({ nodes: [node('n1'), node('n2')] }))
    }).not.toThrow()
  })

  it('refuses a node with no id', () => {
    expect(() => {
      validateNodes(workflow({ nodes: [node('')] }))
    }).toThrow('Node must have id')
  })

  it('refuses a node with no name, naming the node', () => {
    expect(() => {
      validateNodes(workflow({ nodes: [node('n1', '')] }))
    }).toThrow('Node n1 must have name')
  })

  it('refuses a node with no type', () => {
    expect(() => {
      validateNodes(workflow({ nodes: [{ ...node('n1'), nodeType: '' }] }))
    }).toThrow('must have nodeType')
  })

  // Two nodes sharing an id makes every connection to it ambiguous.
  it('refuses a duplicate id', () => {
    expect(() => {
      validateNodes(workflow({ nodes: [node('n1', 'a'), node('n1', 'b')] }))
    }).toThrow('Duplicate node id: n1')
  })

  it('refuses a duplicate name', () => {
    expect(() => {
      validateNodes(workflow({ nodes: [node('n1', 'x'), node('n2', 'x')] }))
    }).toThrow('Duplicate node name: x')
  })
})

describe('validateConnections', () => {
  const wire = (source: string, target: string) =>
    workflow({
      nodes: [node('n1'), node('n2')],
      connections: { [source]: { main: { 0: [{ node: target }] } } },
    })

  it('accepts a connection between two real nodes', () => {
    expect(() => {
      validateConnections(wire('n1', 'n2'))
    }).not.toThrow()
  })

  it('refuses a source node that does not exist', () => {
    expect(() => {
      validateConnections(wire('ghost', 'n2'))
    }).toThrow('Connection source node not found: ghost')
  })

  it('refuses a target node that does not exist', () => {
    expect(() => {
      validateConnections(wire('n1', 'ghost'))
    }).toThrow('Connection target node not found: ghost')
  })

  // An empty target is an unwired output, not a broken connection.
  it('allows an unwired output', () => {
    expect(() => {
      validateConnections(wire('n1', ''))
    }).not.toThrow()
  })

  it('accepts a workflow with no connections', () => {
    expect(() => {
      validateConnections(workflow())
    }).not.toThrow()
  })
})

describe('validateMultiTenant', () => {
  it('accepts a workflow that belongs to a tenant', () => {
    expect(() => {
      validateMultiTenant(workflow())
    }).not.toThrow()
  })

  // Without a tenant, every downstream query is unscoped.
  it('refuses a workflow with no tenant', () => {
    expect(() => {
      validateMultiTenant(workflow({ tenantId: '' }))
    }).toThrow('must have tenantId')
  })

  it('refuses a global-scope variable, naming it', () => {
    expect(() => {
      validateMultiTenant(
        workflow({ variables: { shared: { scope: 'global' } } })
      )
    }).toThrow('Variable shared has global scope')
  })

  it.each(['workflow', 'execution'])('allows %s scope', scope => {
    expect(() => {
      validateMultiTenant(workflow({ variables: { v: { scope } } }))
    }).not.toThrow()
  })
})

describe('validateAll', () => {
  it('accepts a sound workflow', () => {
    expect(() => {
      validateAll(workflow())
    }).not.toThrow()
  })

  // Structure first: the node rules would read an absent nodes array.
  it('reports the structural problem before the tenant one', () => {
    expect(() => {
      validateAll(workflow({ nodes: [], tenantId: '' }))
    }).toThrow('at least one node')
  })
})
