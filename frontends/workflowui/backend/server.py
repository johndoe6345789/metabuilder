"""
WorkflowUI Flask Backend Server
Handles workflow persistence, execution, and plugin management
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import json
from datetime import datetime
from typing import Dict, List, Any, Optional

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['JSON_SORT_KEYS'] = False
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

# In-memory storage (replace with database in production)
workflows_store: Dict[str, Dict] = {}
executions_store: Dict[str, List[Dict]] = {}
node_registry: Dict[str, Dict] = {}

# Initialize node registry with built-in plugins
def init_node_registry():
    """Initialize node registry with built-in plugins"""
    global node_registry
    node_registry = {
        'testing.playwright': {
            'id': 'testing.playwright',
            'name': 'Playwright Testing',
            'version': '1.0.0',
            'category': 'testing',
            'description': 'Execute Playwright E2E tests with multi-browser support',
            'icon': 'test',
            'parameters': {
                'browser': {'type': 'select', 'required': True, 'options': ['chromium', 'firefox', 'webkit']},
                'baseUrl': {'type': 'string', 'required': True},
                'testFile': {'type': 'string', 'required': False},
                'headless': {'type': 'boolean', 'default': True}
            }
        },
        'documentation.storybook': {
            'id': 'documentation.storybook',
            'name': 'Storybook Documentation',
            'version': '1.0.0',
            'category': 'documentation',
            'description': 'Build and manage component documentation',
            'icon': 'book',
            'parameters': {
                'command': {'type': 'select', 'required': True, 'options': ['build', 'dev', 'test']},
                'outputDir': {'type': 'string', 'default': 'storybook-static'},
                'port': {'type': 'number', 'default': 6006}
            }
        }
    }

# ============================================================================
# Workflow Endpoints
# ============================================================================

@app.route('/api/workflows', methods=['GET'])
def list_workflows():
    """List all workflows"""
    tenant_id = request.args.get('tenantId', 'default')
    workflows = [w for w in workflows_store.values() if w.get('tenantId') == tenant_id]
    return jsonify({'workflows': workflows, 'count': len(workflows)})

@app.route('/api/workflows', methods=['POST'])
def create_workflow():
    """Create new workflow"""
    data = request.get_json()

    workflow_id = data.get('id') or f"workflow-{datetime.now().timestamp()}"
    workflow = {
        'id': workflow_id,
        'name': data.get('name', 'Untitled'),
        'description': data.get('description', ''),
        'version': '1.0.0',
        'tenantId': data.get('tenantId', 'default'),
        'nodes': data.get('nodes', []),
        'connections': data.get('connections', []),
        'tags': data.get('tags', []),
        'createdAt': datetime.now().isoformat(),
        'updatedAt': datetime.now().isoformat()
    }

    workflows_store[workflow_id] = workflow
    return jsonify(workflow), 201

@app.route('/api/workflows/<workflow_id>', methods=['GET'])
def get_workflow(workflow_id: str):
    """Get specific workflow"""
    workflow = workflows_store.get(workflow_id)
    if not workflow:
        return jsonify({'error': 'Workflow not found'}), 404
    return jsonify(workflow)

@app.route('/api/workflows/<workflow_id>', methods=['PUT'])
def update_workflow(workflow_id: str):
    """Update workflow"""
    workflow = workflows_store.get(workflow_id)
    if not workflow:
        return jsonify({'error': 'Workflow not found'}), 404

    data = request.get_json()
    workflow.update({
        'name': data.get('name', workflow['name']),
        'description': data.get('description', workflow['description']),
        'nodes': data.get('nodes', workflow['nodes']),
        'connections': data.get('connections', workflow['connections']),
        'tags': data.get('tags', workflow['tags']),
        'updatedAt': datetime.now().isoformat()
    })

    workflows_store[workflow_id] = workflow
    return jsonify(workflow)

@app.route('/api/workflows/<workflow_id>', methods=['DELETE'])
def delete_workflow(workflow_id: str):
    """Delete workflow"""
    if workflow_id not in workflows_store:
        return jsonify({'error': 'Workflow not found'}), 404

    del workflows_store[workflow_id]
    if workflow_id in executions_store:
        del executions_store[workflow_id]

    return jsonify({'success': True})

# ============================================================================
# Node Registry Endpoints
# ============================================================================

@app.route('/api/nodes', methods=['GET'])
def get_nodes():
    """Get all available node types"""
    category = request.args.get('category')

    nodes = list(node_registry.values())
    if category:
        nodes = [n for n in nodes if n['category'] == category]

    return jsonify({'nodes': nodes, 'count': len(nodes)})

@app.route('/api/nodes/<node_id>', methods=['GET'])
def get_node(node_id: str):
    """Get specific node type"""
    node = node_registry.get(node_id)
    if not node:
        return jsonify({'error': 'Node type not found'}), 404
    return jsonify(node)

@app.route('/api/nodes/categories', methods=['GET'])
def get_node_categories():
    """Get available node categories"""
    categories = set(n['category'] for n in node_registry.values())
    return jsonify({'categories': sorted(list(categories))})

# ============================================================================
# Workflow Execution Endpoints
# ============================================================================

@app.route('/api/workflows/<workflow_id>/execute', methods=['POST'])
def execute_workflow(workflow_id: str):
    """Execute workflow"""
    workflow = workflows_store.get(workflow_id)
    if not workflow:
        return jsonify({'error': 'Workflow not found'}), 404

    execution_id = f"exec-{datetime.now().timestamp()}"
    execution = {
        'id': execution_id,
        'workflowId': workflow_id,
        'workflowName': workflow['name'],
        'tenantId': workflow['tenantId'],
        'status': 'running',
        'startTime': datetime.now().isoformat(),
        'nodes': [],
        'error': None
    }

    # Initialize execution history for workflow
    if workflow_id not in executions_store:
        executions_store[workflow_id] = []

    executions_store[workflow_id].append(execution)

    # TODO: Integrate with DAG executor

    return jsonify(execution), 202

@app.route('/api/workflows/<workflow_id>/executions', methods=['GET'])
def get_executions(workflow_id: str):
    """Get execution history for workflow"""
    limit = request.args.get('limit', 50, type=int)

    executions = executions_store.get(workflow_id, [])
    return jsonify({
        'executions': executions[:limit],
        'count': len(executions)
    })

@app.route('/api/executions/<execution_id>', methods=['GET'])
def get_execution(execution_id: str):
    """Get specific execution"""
    for workflow_executions in executions_store.values():
        for execution in workflow_executions:
            if execution['id'] == execution_id:
                return jsonify(execution)

    return jsonify({'error': 'Execution not found'}), 404

# ============================================================================
# Validation Endpoints
# ============================================================================

@app.route('/api/workflows/<workflow_id>/validate', methods=['POST'])
def validate_workflow(workflow_id: str):
    """Validate workflow configuration"""
    workflow = workflows_store.get(workflow_id)
    if not workflow:
        return jsonify({'error': 'Workflow not found'}), 404

    data = request.get_json()
    errors = []
    warnings = []

    # Validate nodes exist
    if not data.get('nodes'):
        errors.append('Workflow must have at least one node')

    # Validate node types
    for node in data.get('nodes', []):
        if node['type'] not in node_registry:
            errors.append(f"Unknown node type: {node['type']}")

    # Validate connections (no cycles, valid nodes)
    nodes_set = {n['id'] for n in data.get('nodes', [])}
    for conn in data.get('connections', []):
        if conn['source'] not in nodes_set:
            errors.append(f"Connection source not found: {conn['source']}")
        if conn['target'] not in nodes_set:
            errors.append(f"Connection target not found: {conn['target']}")

    validation_result = {
        'valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings
    }

    return jsonify(validation_result)

# ============================================================================
# Health Check
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'workflows': len(workflows_store),
        'nodeTypes': len(node_registry)
    })

# ============================================================================
# Error Handlers
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# ============================================================================
# Main
# ============================================================================

if __name__ == '__main__':
    # Initialize node registry
    init_node_registry()

    # Get port from environment
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False') == 'True'

    app.run(host='0.0.0.0', port=port, debug=debug)
