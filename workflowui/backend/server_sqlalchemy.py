"""
WorkflowUI Flask Backend Server with SQLAlchemy
Handles workflow persistence, execution, and plugin management with database storage
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from models import db, Workflow, Execution, NodeType, AuditLog
import os
import json
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)

# Configuration
app.config['JSON_SORT_KEYS'] = False
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

# Database configuration
db_url = os.getenv('DATABASE_URL', 'sqlite:///workflows.db')
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)
CORS(app)

# Node registry (cached in-memory, loaded from database on startup)
node_registry: Dict[str, Dict] = {}


def init_node_registry():
    """Initialize node registry from database"""
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

    # Sync registry to database
    for node_id, node_data in node_registry.items():
        existing = NodeType.query.filter_by(id=node_id).first()
        if not existing:
            node_type = NodeType.from_dict(node_data)
            db.session.add(node_type)
    db.session.commit()


def log_audit(
    workflow_id: str,
    tenant_id: str,
    action: str,
    entity_type: str,
    changes: Optional[Dict] = None,
    user_id: Optional[str] = None
):
    """Create audit log entry"""
    log_entry = AuditLog(
        workflow_id=workflow_id,
        tenant_id=tenant_id,
        action=action,
        entity_type=entity_type,
        changes_json=json.dumps(changes) if changes else None,
        user_id=user_id,
        ip_address=request.remote_addr
    )
    db.session.add(log_entry)
    db.session.commit()


# ============================================================================
# Workflow Endpoints
# ============================================================================

@app.route('/api/workflows', methods=['GET'])
def list_workflows():
    """List all workflows for tenant"""
    tenant_id = request.args.get('tenantId', 'default')
    limit = request.args.get('limit', 50, type=int)
    offset = request.args.get('offset', 0, type=int)

    try:
        query = Workflow.query.filter_by(tenant_id=tenant_id).limit(limit).offset(offset)
        workflows = [w.to_dict() for w in query]
        total = Workflow.query.filter_by(tenant_id=tenant_id).count()

        return jsonify({
            'workflows': workflows,
            'count': len(workflows),
            'total': total
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/workflows', methods=['POST'])
def create_workflow():
    """Create new workflow"""
    try:
        data = request.get_json()

        # Validate required fields
        if not data.get('name'):
            return jsonify({'error': 'Workflow name is required'}), 400

        tenant_id = data.get('tenantId', 'default')
        workflow_id = data.get('id') or f"workflow-{datetime.utcnow().timestamp()}"

        # Check for duplicates
        existing = Workflow.query.filter_by(id=workflow_id).first()
        if existing:
            return jsonify({'error': 'Workflow ID already exists'}), 409

        # Create workflow
        workflow = Workflow.from_dict(data)
        db.session.add(workflow)
        db.session.commit()

        # Audit log
        log_audit(workflow.id, tenant_id, 'create', 'workflow')

        return jsonify(workflow.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/workflows/<workflow_id>', methods=['GET'])
def get_workflow(workflow_id: str):
    """Get specific workflow"""
    try:
        workflow = Workflow.query.get(workflow_id)
        if not workflow:
            return jsonify({'error': 'Workflow not found'}), 404

        return jsonify(workflow.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/workflows/<workflow_id>', methods=['PUT'])
def update_workflow(workflow_id: str):
    """Update workflow"""
    try:
        data = request.get_json()
        workflow = Workflow.query.get(workflow_id)

        if not workflow:
            return jsonify({'error': 'Workflow not found'}), 404

        # Track changes for audit log
        changes = {}

        if 'name' in data and data['name'] != workflow.name:
            changes['name'] = (workflow.name, data['name'])
            workflow.name = data['name']

        if 'description' in data:
            changes['description'] = (workflow.description, data.get('description'))
            workflow.description = data.get('description', '')

        if 'nodes' in data:
            workflow.nodes_json = json.dumps(data['nodes'])

        if 'connections' in data:
            workflow.connections_json = json.dumps(data['connections'])

        if 'tags' in data:
            workflow.tags_json = json.dumps(data['tags'])

        workflow.updated_at = datetime.utcnow()

        db.session.commit()

        # Audit log
        if changes:
            log_audit(workflow_id, workflow.tenant_id, 'update', 'workflow', changes)

        return jsonify(workflow.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/workflows/<workflow_id>', methods=['DELETE'])
def delete_workflow(workflow_id: str):
    """Delete workflow"""
    try:
        workflow = Workflow.query.get(workflow_id)
        if not workflow:
            return jsonify({'error': 'Workflow not found'}), 404

        tenant_id = workflow.tenant_id

        # Delete related executions (cascade)
        Execution.query.filter_by(workflow_id=workflow_id).delete()

        # Delete workflow
        db.session.delete(workflow)
        db.session.commit()

        # Audit log
        log_audit(workflow_id, tenant_id, 'delete', 'workflow')

        return jsonify({'success': True}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ============================================================================
# Node Registry Endpoints
# ============================================================================

@app.route('/api/nodes', methods=['GET'])
def get_nodes():
    """Get all available node types"""
    try:
        category = request.args.get('category')

        nodes_list = list(node_registry.values())
        if category:
            nodes_list = [n for n in nodes_list if n['category'] == category]

        return jsonify({'nodes': nodes_list, 'count': len(nodes_list)}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/nodes/<node_id>', methods=['GET'])
def get_node(node_id: str):
    """Get specific node type"""
    try:
        node = node_registry.get(node_id)
        if not node:
            return jsonify({'error': 'Node type not found'}), 404

        return jsonify(node), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/nodes/categories', methods=['GET'])
def get_node_categories():
    """Get available node categories"""
    try:
        categories = list(set(n['category'] for n in node_registry.values()))
        return jsonify({'categories': sorted(categories)}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# Workflow Execution Endpoints
# ============================================================================

@app.route('/api/workflows/<workflow_id>/execute', methods=['POST'])
def execute_workflow(workflow_id: str):
    """Execute workflow"""
    try:
        workflow = Workflow.query.get(workflow_id)
        if not workflow:
            return jsonify({'error': 'Workflow not found'}), 404

        data = request.get_json() or {}

        execution_id = f"exec-{datetime.utcnow().timestamp()}"
        execution = Execution(
            id=execution_id,
            workflow_id=workflow_id,
            workflow_name=workflow.name,
            tenant_id=workflow.tenant_id,
            status='running',
            start_time=datetime.utcnow(),
            input_json=json.dumps(data.get('input')) if data.get('input') else None
        )

        db.session.add(execution)
        db.session.commit()

        # Audit log
        log_audit(workflow_id, workflow.tenant_id, 'execute', 'execution')

        return jsonify(execution.to_dict()), 202
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/workflows/<workflow_id>/executions', methods=['GET'])
def get_executions(workflow_id: str):
    """Get execution history for workflow"""
    try:
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)

        query = (
            Execution.query
            .filter_by(workflow_id=workflow_id)
            .order_by(Execution.created_at.desc())
            .limit(limit)
            .offset(offset)
        )

        executions = [e.to_dict() for e in query]
        total = Execution.query.filter_by(workflow_id=workflow_id).count()

        return jsonify({
            'executions': executions,
            'count': len(executions),
            'total': total
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/executions/<execution_id>', methods=['GET'])
def get_execution(execution_id: str):
    """Get specific execution"""
    try:
        execution = Execution.query.get(execution_id)
        if not execution:
            return jsonify({'error': 'Execution not found'}), 404

        return jsonify(execution.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# Validation Endpoints
# ============================================================================

@app.route('/api/workflows/<workflow_id>/validate', methods=['POST'])
def validate_workflow(workflow_id: str):
    """Validate workflow configuration"""
    try:
        workflow = Workflow.query.get(workflow_id)
        if not workflow:
            return jsonify({'error': 'Workflow not found'}), 404

        data = request.get_json() or {}
        errors = []
        warnings = []

        # Validate nodes exist
        nodes = data.get('nodes', [])
        if not nodes:
            errors.append('Workflow must have at least one node')

        # Validate node types
        for node in nodes:
            if node.get('type') not in node_registry:
                errors.append(f"Unknown node type: {node.get('type')}")

        # Validate connections
        nodes_set = {n['id'] for n in nodes}
        connections = data.get('connections', [])

        for conn in connections:
            source = conn.get('source')
            target = conn.get('target')

            if source not in nodes_set:
                errors.append(f"Connection source not found: {source}")
            if target not in nodes_set:
                errors.append(f"Connection target not found: {target}")
            if source == target:
                errors.append(f"Self-connections not allowed: {source}")

        validation_result = {
            'valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }

        return jsonify(validation_result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# Health Check
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        workflow_count = Workflow.query.count()
        execution_count = Execution.query.count()
        node_count = len(node_registry)

        return jsonify({
            'status': 'ok',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '2.0.0',
            'workflows': workflow_count,
            'executions': execution_count,
            'nodeTypes': node_count,
            'database': 'connected'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'database': 'disconnected'
        }), 500


# ============================================================================
# Error Handlers
# ============================================================================

@app.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad request'}), 400


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
    with app.app_context():
        # Create database tables
        db.create_all()

        # Initialize node registry
        init_node_registry()

    # Get configuration from environment
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False') == 'True'
    host = os.getenv('HOST', '0.0.0.0')

    print(f"Starting WorkflowUI Backend on {host}:{port}")
    print(f"Database: {os.getenv('DATABASE_URL', 'sqlite:///workflows.db')}")

    app.run(host=host, port=port, debug=debug)
