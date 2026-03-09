"""
WorkflowUI Flask Backend Server with SQLAlchemy
Handles workflow persistence, execution, and plugin management with database storage
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from models import db, Workflow, Execution, NodeType, AuditLog, Workspace, Project, ProjectCanvasItem
from auth import token_required
import os
import json
import socket
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
import imaplib
import email
from email.header import decode_header

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
# Workspace Endpoints
# ============================================================================

@app.route('/api/workspaces', methods=['GET'])
@token_required
def list_workspaces():
    """List all workspaces for tenant"""
    tenant_id = request.args.get('tenantId', 'default')
    limit = request.args.get('limit', 50, type=int)
    offset = request.args.get('offset', 0, type=int)

    try:
        query = Workspace.query.filter_by(tenant_id=tenant_id).limit(limit).offset(offset)
        workspaces = [w.to_dict() for w in query]
        total = Workspace.query.filter_by(tenant_id=tenant_id).count()

        return jsonify({
            'workspaces': workspaces,
            'count': len(workspaces),
            'total': total
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/workspaces', methods=['POST'])
@token_required
def create_workspace():
    """Create new workspace"""
    try:
        data = request.get_json()

        if not data.get('name'):
            return jsonify({'error': 'Workspace name is required'}), 400

        tenant_id = data.get('tenantId', 'default')
        workspace_id = data.get('id') or f"workspace-{datetime.utcnow().timestamp()}"

        existing = Workspace.query.filter_by(id=workspace_id).first()
        if existing:
            return jsonify({'error': 'Workspace ID already exists'}), 409

        workspace = Workspace.from_dict(data)
        db.session.add(workspace)
        db.session.commit()

        return jsonify(workspace.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/workspaces/<workspace_id>', methods=['GET'])
@token_required
def get_workspace(workspace_id: str):
    """Get specific workspace"""
    try:
        workspace = Workspace.query.get(workspace_id)
        if not workspace:
            return jsonify({'error': 'Workspace not found'}), 404

        return jsonify(workspace.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/workspaces/<workspace_id>', methods=['PUT'])
@token_required
def update_workspace(workspace_id: str):
    """Update workspace"""
    try:
        data = request.get_json()
        workspace = Workspace.query.get(workspace_id)

        if not workspace:
            return jsonify({'error': 'Workspace not found'}), 404

        if 'name' in data:
            workspace.name = data['name']
        if 'description' in data:
            workspace.description = data['description']
        if 'icon' in data:
            workspace.icon = data['icon']
        if 'color' in data:
            workspace.color = data['color']

        workspace.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify(workspace.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/workspaces/<workspace_id>', methods=['DELETE'])
@token_required
def delete_workspace(workspace_id: str):
    """Delete workspace"""
    try:
        workspace = Workspace.query.get(workspace_id)
        if not workspace:
            return jsonify({'error': 'Workspace not found'}), 404

        db.session.delete(workspace)
        db.session.commit()

        return jsonify({'success': True}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ============================================================================
# Project Endpoints
# ============================================================================

@app.route('/api/projects', methods=['GET'])
@token_required
def list_projects():
    """List all projects"""
    tenant_id = request.args.get('tenantId', 'default')
    workspace_id = request.args.get('workspaceId')
    limit = request.args.get('limit', 50, type=int)
    offset = request.args.get('offset', 0, type=int)

    try:
        query = Project.query.filter_by(tenant_id=tenant_id)
        if workspace_id:
            query = query.filter_by(workspace_id=workspace_id)

        query = query.limit(limit).offset(offset)
        projects = [p.to_dict() for p in query]

        count_query = Project.query.filter_by(tenant_id=tenant_id)
        if workspace_id:
            count_query = count_query.filter_by(workspace_id=workspace_id)
        total = count_query.count()

        return jsonify({
            'projects': projects,
            'count': len(projects),
            'total': total
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/projects', methods=['POST'])
@token_required
def create_project():
    """Create new project"""
    try:
        data = request.get_json()

        if not data.get('name'):
            return jsonify({'error': 'Project name is required'}), 400
        if not data.get('workspaceId'):
            return jsonify({'error': 'Workspace ID is required'}), 400

        tenant_id = data.get('tenantId', 'default')
        project_id = data.get('id') or f"project-{datetime.utcnow().timestamp()}"

        existing = Project.query.filter_by(id=project_id).first()
        if existing:
            return jsonify({'error': 'Project ID already exists'}), 409

        project = Project.from_dict(data)
        db.session.add(project)
        db.session.commit()

        return jsonify(project.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/projects/<project_id>', methods=['GET'])
@token_required
def get_project(project_id: str):
    """Get specific project"""
    try:
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'error': 'Project not found'}), 404

        return jsonify(project.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/projects/<project_id>', methods=['PUT'])
@token_required
def update_project(project_id: str):
    """Update project"""
    try:
        data = request.get_json()
        project = Project.query.get(project_id)

        if not project:
            return jsonify({'error': 'Project not found'}), 404

        if 'name' in data:
            project.name = data['name']
        if 'description' in data:
            project.description = data['description']
        if 'color' in data:
            project.color = data['color']
        if 'starred' in data:
            project.starred = data['starred']

        project.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify(project.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/projects/<project_id>', methods=['DELETE'])
@token_required
def delete_project(project_id: str):
    """Delete project"""
    try:
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'error': 'Project not found'}), 404

        db.session.delete(project)
        db.session.commit()

        return jsonify({'success': True}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ============================================================================
# Project Canvas Endpoints
# ============================================================================

@app.route('/api/projects/<project_id>/canvas', methods=['GET'])
@token_required
def get_canvas_items(project_id: str):
    """Get all canvas items for project"""
    try:
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'error': 'Project not found'}), 404

        items = ProjectCanvasItem.query.filter_by(project_id=project_id).all()
        canvas_items = [item.to_dict() for item in items]

        return jsonify({
            'items': canvas_items,
            'count': len(canvas_items)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/projects/<project_id>/canvas/items', methods=['POST'])
@token_required
def create_canvas_item(project_id: str):
    """Create new canvas item"""
    try:
        data = request.get_json()

        if not data.get('workflowId'):
            return jsonify({'error': 'Workflow ID is required'}), 400

        item_id = data.get('id') or f"canvas-{datetime.utcnow().timestamp()}"

        existing = ProjectCanvasItem.query.filter_by(id=item_id).first()
        if existing:
            return jsonify({'error': 'Canvas item ID already exists'}), 409

        canvas_item = ProjectCanvasItem.from_dict({
            **data,
            'projectId': project_id,
            'id': item_id
        })
        db.session.add(canvas_item)
        db.session.commit()

        return jsonify(canvas_item.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/projects/<project_id>/canvas/items/<item_id>', methods=['PUT'])
@token_required
def update_canvas_item(project_id: str, item_id: str):
    """Update canvas item"""
    try:
        data = request.get_json()
        canvas_item = ProjectCanvasItem.query.get(item_id)

        if not canvas_item or canvas_item.project_id != project_id:
            return jsonify({'error': 'Canvas item not found'}), 404

        position = data.get('position', {})
        if 'x' in position or 'y' in position:
            canvas_item.position_x = position.get('x', canvas_item.position_x)
            canvas_item.position_y = position.get('y', canvas_item.position_y)

        size = data.get('size', {})
        if 'width' in size or 'height' in size:
            canvas_item.width = size.get('width', canvas_item.width)
            canvas_item.height = size.get('height', canvas_item.height)

        if 'zIndex' in data:
            canvas_item.z_index = data['zIndex']
        if 'color' in data:
            canvas_item.color = data['color']
        if 'minimized' in data:
            canvas_item.minimized = data['minimized']

        canvas_item.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify(canvas_item.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/projects/<project_id>/canvas/items/<item_id>', methods=['DELETE'])
@token_required
def delete_canvas_item(project_id: str, item_id: str):
    """Delete canvas item"""
    try:
        canvas_item = ProjectCanvasItem.query.get(item_id)

        if not canvas_item or canvas_item.project_id != project_id:
            return jsonify({'error': 'Canvas item not found'}), 404

        db.session.delete(canvas_item)
        db.session.commit()

        return jsonify({'success': True}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/projects/<project_id>/canvas/bulk-update', methods=['POST'])
@token_required
def bulk_update_canvas_items(project_id: str):
    """Bulk update multiple canvas items"""
    try:
        data = request.get_json()
        items = data.get('items', [])

        updated_items = []
        for item_data in items:
            item_id = item_data.get('id')
            canvas_item = ProjectCanvasItem.query.get(item_id)

            if not canvas_item or canvas_item.project_id != project_id:
                continue

            position = item_data.get('position', {})
            if position:
                canvas_item.position_x = position.get('x', canvas_item.position_x)
                canvas_item.position_y = position.get('y', canvas_item.position_y)

            size = item_data.get('size', {})
            if size:
                canvas_item.width = size.get('width', canvas_item.width)
                canvas_item.height = size.get('height', canvas_item.height)

            if 'zIndex' in item_data:
                canvas_item.z_index = item_data['zIndex']
            if 'color' in item_data:
                canvas_item.color = item_data['color']
            if 'minimized' in item_data:
                canvas_item.minimized = item_data['minimized']

            canvas_item.updated_at = datetime.utcnow()
            updated_items.append(canvas_item.to_dict())

        db.session.commit()

        return jsonify({
            'items': updated_items,
            'count': len(updated_items)
        }), 200
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
# Email Endpoints (IMAP Client)
# ============================================================================

@app.route('/api/emails/connect', methods=['POST'])
def connect_email():
    """Connect to IMAP server"""
    try:
        data = request.get_json()
        host = data.get('host', 'localhost')
        port = data.get('port', 143)
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400

        # Test connection with TLS and self-signed cert
        import ssl
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE

        try:
            imap = imaplib.IMAP4_SSL(host, 993, ssl_context=context, timeout=10)
        except:
            imap = imaplib.IMAP4(host, port, timeout=10)
            imap.starttls(ssl_context=context)

        imap.login(username, password)
        try:
            imap.logout()
        except:
            pass

        return jsonify({
            'status': 'connected',
            'message': 'Successfully connected to IMAP server'
        }), 200
    except Exception as e:
        return jsonify({'error': f'Connection failed: {str(e)}'}), 500


@app.route('/api/emails/list', methods=['POST'])
def list_emails():
    """List emails from IMAP mailbox"""
    try:
        data = request.get_json()
        host = data.get('host', 'localhost')
        port = data.get('port', 143)
        username = data.get('username')
        password = data.get('password')
        mailbox = data.get('mailbox', 'INBOX')
        limit = data.get('limit', 20)

        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400

        import ssl
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE

        try:
            imap = imaplib.IMAP4_SSL(host, 993, ssl_context=context, timeout=10)
        except:
            imap = imaplib.IMAP4(host, port, timeout=10)
            imap.starttls(ssl_context=context)

        imap.login(username, password)
        imap.select(mailbox)

        # Get email IDs
        status, messages = imap.search(None, 'ALL')
        email_ids = messages[0].split()[-limit:] if messages[0] else []

        emails = []
        for email_id in reversed(email_ids):
            status, msg_data = imap.fetch(email_id, '(RFC822)')
            msg = email.message_from_bytes(msg_data[0][1])

            # Decode subject
            subject = msg.get('Subject', '')
            if isinstance(subject, str):
                try:
                    decoded_parts = decode_header(subject)
                    subject = ''.join([part[0].decode(part[1] or 'utf-8') if isinstance(part[0], bytes) else part[0] for part in decoded_parts])
                except:
                    pass

            emails.append({
                'id': email_id.decode(),
                'from': msg.get('From', ''),
                'subject': subject,
                'date': msg.get('Date', ''),
                'body_preview': (msg.get_payload(decode=True) or b'').decode('utf-8', errors='ignore')[:200]
            })

        try:
            imap.logout()
        except:
            pass

        return jsonify({
            'emails': emails,
            'count': len(emails),
            'mailbox': mailbox
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to list emails: {str(e)}'}), 500


@app.route('/api/emails/read', methods=['POST'])
def read_email():
    """Read specific email"""
    try:
        data = request.get_json()
        host = data.get('host', 'localhost')
        port = data.get('port', 143)
        username = data.get('username')
        password = data.get('password')
        email_id = data.get('email_id')
        mailbox = data.get('mailbox', 'INBOX')

        if not username or not password or not email_id:
            return jsonify({'error': 'Missing required fields'}), 400

        import ssl
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE

        try:
            imap = imaplib.IMAP4_SSL(host, 993, ssl_context=context, timeout=10)
        except:
            imap = imaplib.IMAP4(host, port, timeout=10)
            imap.starttls(ssl_context=context)

        imap.login(username, password)
        imap.select(mailbox)

        status, msg_data = imap.fetch(email_id, '(RFC822)')
        msg = email.message_from_bytes(msg_data[0][1])

        # Extract body
        body = ''
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == 'text/plain':
                    body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                    break
        else:
            body = msg.get_payload(decode=True).decode('utf-8', errors='ignore')

        # Decode subject
        subject = msg.get('Subject', '')
        if isinstance(subject, str):
            try:
                decoded_parts = decode_header(subject)
                subject = ''.join([part[0].decode(part[1] or 'utf-8') if isinstance(part[0], bytes) else part[0] for part in decoded_parts])
            except:
                pass

        try:
            imap.logout()
        except:
            pass

        return jsonify({
            'id': email_id,
            'from': msg.get('From', ''),
            'to': msg.get('To', ''),
            'subject': subject,
            'date': msg.get('Date', ''),
            'body': body,
            'headers': dict(msg.items())
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to read email: {str(e)}'}), 500


@app.route('/api/emails/mailboxes', methods=['POST'])
def list_mailboxes():
    """List available mailboxes"""
    try:
        data = request.get_json()
        host = data.get('host', 'localhost')
        port = data.get('port', 143)
        username = data.get('username')
        password = data.get('password')
        use_ssl = data.get('use_ssl', False)

        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400

        import ssl
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE

        try:
            imap = imaplib.IMAP4_SSL(host, 993, ssl_context=context, timeout=10)
        except:
            imap = imaplib.IMAP4(host, port, timeout=10)
            imap.starttls(ssl_context=context)

        imap.login(username, password)

        status, mailboxes = imap.list()
        mailbox_list = []

        for mailbox in mailboxes:
            mailbox_str = mailbox.decode().split('"') if isinstance(mailbox, bytes) else mailbox
            mailbox_list.append(mailbox)

        try:
            imap.logout()
        except:
            pass

        return jsonify({
            'mailboxes': [m.decode() if isinstance(m, bytes) else m for m in mailbox_list],
            'count': len(mailbox_list)
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to list mailboxes: {str(e)}'}), 500


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
# Utilities
# ============================================================================

def find_available_port(start_port: int, max_attempts: int = 10) -> int:
    """Find an available port starting from start_port"""
    for offset in range(max_attempts):
        port = start_port + offset
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            sock.bind(('0.0.0.0', port))
            sock.close()
            return port
        except OSError:
            continue
    raise RuntimeError(f"Could not find available port in range {start_port}-{start_port + max_attempts}")


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
    preferred_port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False') == 'True'
    host = os.getenv('HOST', '0.0.0.0')

    # Auto-bump port if in use
    port = find_available_port(preferred_port)
    if port != preferred_port:
        print(f"⚠️  Port {preferred_port} in use, using port {port} instead")

    print(f"Starting WorkflowUI Backend on {host}:{port}")
    print(f"Database: {os.getenv('DATABASE_URL', 'sqlite:///workflows.db')}")

    app.run(host=host, port=port, debug=debug)
