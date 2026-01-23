"""
SQLAlchemy Database Models
Defines the data schema for workflows, executions, and node types
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json
from typing import Optional, List, Dict, Any

db = SQLAlchemy()


class User(db.Model):
    """User model for authentication"""

    __tablename__ = 'users'

    id = db.Column(db.String(255), primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        db.Index('idx_email', 'email'),
    )


class Workflow(db.Model):
    """Workflow model representing a complete DAG workflow"""

    __tablename__ = 'workflows'

    id = db.Column(db.String(255), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    version = db.Column(db.String(50), default='1.0.0')
    tenant_id = db.Column(db.String(255), nullable=False, index=True)

    # JSON fields for workflow structure
    nodes_json = db.Column(db.Text, default='[]')  # Array of node objects
    connections_json = db.Column(db.Text, default='[]')  # Array of edge objects
    tags_json = db.Column(db.Text, default='[]')  # Array of tag strings

    # Project organization (NEW)
    project_id = db.Column(db.String(255), db.ForeignKey('projects.id'), nullable=True)
    workspace_id = db.Column(db.String(255), db.ForeignKey('workspaces.id'), nullable=True)
    starred = db.Column(db.Boolean, default=False)

    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    executions = db.relationship('Execution', backref='workflow', cascade='all, delete-orphan', lazy=True)

    # Indexes for efficient querying
    __table_args__ = (
        db.Index('idx_workflow_tenant_id', 'tenant_id'),
        db.Index('idx_workflow_tenant_name', 'tenant_id', 'name'),
        db.Index('idx_workflow_project_id', 'project_id'),
        db.Index('idx_workflow_workspace_id', 'workspace_id'),
        db.Index('idx_workflow_tenant_project', 'tenant_id', 'project_id'),
    )

    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'version': self.version,
            'tenantId': self.tenant_id,
            'projectId': self.project_id,
            'workspaceId': self.workspace_id,
            'starred': self.starred,
            'nodes': json.loads(self.nodes_json),
            'connections': json.loads(self.connections_json),
            'tags': json.loads(self.tags_json),
            'createdAt': int(self.created_at.timestamp() * 1000),
            'updatedAt': int(self.updated_at.timestamp() * 1000)
        }

    @staticmethod
    def from_dict(data: Dict[str, Any]) -> 'Workflow':
        """Create model from dictionary"""
        workflow = Workflow(
            id=data.get('id'),
            name=data.get('name', 'Untitled'),
            description=data.get('description', ''),
            version=data.get('version', '1.0.0'),
            tenant_id=data.get('tenantId', 'default'),
            project_id=data.get('projectId'),
            workspace_id=data.get('workspaceId'),
            starred=data.get('starred', False),
            nodes_json=json.dumps(data.get('nodes', [])),
            connections_json=json.dumps(data.get('connections', [])),
            tags_json=json.dumps(data.get('tags', []))
        )
        return workflow


class Execution(db.Model):
    """Execution model representing a workflow execution run"""

    __tablename__ = 'executions'

    id = db.Column(db.String(255), primary_key=True)
    workflow_id = db.Column(db.String(255), db.ForeignKey('workflows.id'), nullable=False, index=True)
    workflow_name = db.Column(db.String(255), nullable=False)
    tenant_id = db.Column(db.String(255), nullable=False, index=True)

    # Execution state
    status = db.Column(db.String(50), nullable=False, default='pending')  # pending, running, success, error, stopped
    start_time = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    end_time = db.Column(db.DateTime, nullable=True)
    duration = db.Column(db.Integer, nullable=True)  # milliseconds

    # Results and errors
    nodes_json = db.Column(db.Text, default='[]')  # Array of node execution results
    error_json = db.Column(db.Text, nullable=True)  # JSON error object
    input_json = db.Column(db.Text, nullable=True)  # Input parameters
    output_json = db.Column(db.Text, nullable=True)  # Final output

    # Metadata
    triggered_by = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Indexes for efficient querying
    __table_args__ = (
        db.Index('idx_execution_workflow_id', 'workflow_id'),
        db.Index('idx_execution_tenant_workflow', 'tenant_id', 'workflow_id'),
        db.Index('idx_execution_status', 'status'),
    )

    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'workflowId': self.workflow_id,
            'workflowName': self.workflow_name,
            'tenantId': self.tenant_id,
            'status': self.status,
            'startTime': int(self.start_time.timestamp() * 1000),
            'endTime': int(self.end_time.timestamp() * 1000) if self.end_time else None,
            'duration': self.duration,
            'nodes': json.loads(self.nodes_json) if self.nodes_json else [],
            'error': json.loads(self.error_json) if self.error_json else None,
            'input': json.loads(self.input_json) if self.input_json else None,
            'output': json.loads(self.output_json) if self.output_json else None,
            'triggeredBy': self.triggered_by,
            'createdAt': int(self.created_at.timestamp() * 1000)
        }

    @staticmethod
    def from_dict(data: Dict[str, Any]) -> 'Execution':
        """Create model from dictionary"""
        execution = Execution(
            id=data.get('id'),
            workflow_id=data.get('workflowId'),
            workflow_name=data.get('workflowName'),
            tenant_id=data.get('tenantId', 'default'),
            status=data.get('status', 'pending'),
            nodes_json=json.dumps(data.get('nodes', [])),
            error_json=json.dumps(data.get('error')) if data.get('error') else None,
            input_json=json.dumps(data.get('input')) if data.get('input') else None,
            output_json=json.dumps(data.get('output')) if data.get('output') else None,
            triggered_by=data.get('triggeredBy')
        )
        return execution


class NodeType(db.Model):
    """NodeType model caching available node types"""

    __tablename__ = 'node_types'

    id = db.Column(db.String(255), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    version = db.Column(db.String(50), default='1.0.0')
    category = db.Column(db.String(100), nullable=False, index=True)
    description = db.Column(db.Text, default='')
    icon = db.Column(db.String(100), nullable=True)

    # JSON field for node configuration
    parameters_json = db.Column(db.Text, default='{}')

    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        db.Index('idx_category', 'category'),
    )

    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'version': self.version,
            'category': self.category,
            'description': self.description,
            'icon': self.icon,
            'parameters': json.loads(self.parameters_json)
        }

    @staticmethod
    def from_dict(data: Dict[str, Any]) -> 'NodeType':
        """Create model from dictionary"""
        node_type = NodeType(
            id=data.get('id'),
            name=data.get('name'),
            version=data.get('version', '1.0.0'),
            category=data.get('category'),
            description=data.get('description', ''),
            icon=data.get('icon'),
            parameters_json=json.dumps(data.get('parameters', {}))
        )
        return node_type


class AuditLog(db.Model):
    """AuditLog model for tracking workflow changes"""

    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    workflow_id = db.Column(db.String(255), nullable=False, index=True)
    tenant_id = db.Column(db.String(255), nullable=False, index=True)

    action = db.Column(db.String(50), nullable=False)  # create, update, delete, execute
    entity_type = db.Column(db.String(100), nullable=False)  # workflow, execution
    changes_json = db.Column(db.Text, nullable=True)  # JSON of changes

    user_id = db.Column(db.String(255), nullable=True)
    ip_address = db.Column(db.String(100), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        db.Index('idx_audit_workflow_id', 'workflow_id'),
        db.Index('idx_audit_tenant_id', 'tenant_id'),
        db.Index('idx_audit_action', 'action'),
    )

    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'workflowId': self.workflow_id,
            'tenantId': self.tenant_id,
            'action': self.action,
            'entityType': self.entity_type,
            'changes': json.loads(self.changes_json) if self.changes_json else None,
            'userId': self.user_id,
            'ipAddress': self.ip_address,
            'createdAt': int(self.created_at.timestamp() * 1000)
        }


class Workspace(db.Model):
    """Workspace model representing a top-level workspace container"""

    __tablename__ = 'workspaces'

    id = db.Column(db.String(255), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    icon = db.Column(db.String(100), nullable=True)
    color = db.Column(db.String(20), default='#1976d2')
    tenant_id = db.Column(db.String(255), nullable=False, index=True)

    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    projects = db.relationship('Project', backref='workspace', cascade='all, delete-orphan', lazy=True)

    __table_args__ = (
        db.Index('idx_workspace_tenant_id', 'tenant_id'),
    )

    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'color': self.color,
            'tenantId': self.tenant_id,
            'createdAt': int(self.created_at.timestamp() * 1000),
            'updatedAt': int(self.updated_at.timestamp() * 1000)
        }

    @staticmethod
    def from_dict(data: Dict[str, Any]) -> 'Workspace':
        """Create model from dictionary"""
        workspace = Workspace(
            id=data.get('id'),
            name=data.get('name', 'Untitled'),
            description=data.get('description', ''),
            icon=data.get('icon'),
            color=data.get('color', '#1976d2'),
            tenant_id=data.get('tenantId', 'default')
        )
        return workspace


class Project(db.Model):
    """Project model representing a project container within a workspace"""

    __tablename__ = 'projects'

    id = db.Column(db.String(255), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    workspace_id = db.Column(db.String(255), db.ForeignKey('workspaces.id'), nullable=False)
    tenant_id = db.Column(db.String(255), nullable=False, index=True)
    color = db.Column(db.String(20), default='#1976d2')
    starred = db.Column(db.Boolean, default=False)

    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    canvas_items = db.relationship('ProjectCanvasItem', backref='project', cascade='all, delete-orphan', lazy=True)

    __table_args__ = (
        db.Index('idx_project_workspace_id', 'workspace_id'),
        db.Index('idx_project_tenant_id', 'tenant_id'),
        db.Index('idx_project_starred', 'starred'),
        db.Index('idx_project_tenant_workspace', 'tenant_id', 'workspace_id'),
    )

    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'workspaceId': self.workspace_id,
            'tenantId': self.tenant_id,
            'color': self.color,
            'starred': self.starred,
            'createdAt': int(self.created_at.timestamp() * 1000),
            'updatedAt': int(self.updated_at.timestamp() * 1000)
        }

    @staticmethod
    def from_dict(data: Dict[str, Any]) -> 'Project':
        """Create model from dictionary"""
        project = Project(
            id=data.get('id'),
            name=data.get('name', 'Untitled'),
            description=data.get('description', ''),
            workspace_id=data.get('workspaceId'),
            tenant_id=data.get('tenantId', 'default'),
            color=data.get('color', '#1976d2'),
            starred=data.get('starred', False)
        )
        return project


class ProjectCanvasItem(db.Model):
    """ProjectCanvasItem model representing a workflow card on the canvas"""

    __tablename__ = 'project_canvas_items'

    id = db.Column(db.String(255), primary_key=True)
    project_id = db.Column(db.String(255), db.ForeignKey('projects.id'), nullable=False)
    workflow_id = db.Column(db.String(255), db.ForeignKey('workflows.id'), nullable=False)
    position_x = db.Column(db.Float, default=0)
    position_y = db.Column(db.Float, default=0)
    width = db.Column(db.Float, default=300)
    height = db.Column(db.Float, default=200)
    z_index = db.Column(db.Integer, default=0)
    color = db.Column(db.String(20), nullable=True)
    minimized = db.Column(db.Boolean, default=False)

    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        db.Index('idx_canvas_project_id', 'project_id'),
        db.Index('idx_canvas_workflow_id', 'workflow_id'),
        db.Index('idx_canvas_project_workflow', 'project_id', 'workflow_id'),
    )

    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'projectId': self.project_id,
            'workflowId': self.workflow_id,
            'position': {'x': self.position_x, 'y': self.position_y},
            'size': {'width': self.width, 'height': self.height},
            'zIndex': self.z_index,
            'color': self.color,
            'minimized': self.minimized,
            'createdAt': int(self.created_at.timestamp() * 1000),
            'updatedAt': int(self.updated_at.timestamp() * 1000)
        }

    @staticmethod
    def from_dict(data: Dict[str, Any]) -> 'ProjectCanvasItem':
        """Create model from dictionary"""
        position = data.get('position', {'x': 0, 'y': 0})
        size = data.get('size', {'width': 300, 'height': 200})
        canvas_item = ProjectCanvasItem(
            id=data.get('id'),
            project_id=data.get('projectId'),
            workflow_id=data.get('workflowId'),
            position_x=position.get('x', 0),
            position_y=position.get('y', 0),
            width=size.get('width', 300),
            height=size.get('height', 200),
            z_index=data.get('zIndex', 0),
            color=data.get('color'),
            minimized=data.get('minimized', False)
        )
        return canvas_item
