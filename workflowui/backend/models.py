"""
SQLAlchemy Database Models
Defines the data schema for workflows, executions, and node types
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json
from typing import Optional, List, Dict, Any

db = SQLAlchemy()


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

    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    executions = db.relationship('Execution', backref='workflow', cascade='all, delete-orphan', lazy=True)

    # Indexes for efficient querying
    __table_args__ = (
        db.Index('idx_tenant_id', 'tenant_id'),
        db.Index('idx_tenant_name', 'tenant_id', 'name'),
    )

    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'version': self.version,
            'tenantId': self.tenant_id,
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
        db.Index('idx_workflow_id', 'workflow_id'),
        db.Index('idx_tenant_workflow', 'tenant_id', 'workflow_id'),
        db.Index('idx_status', 'status'),
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
        db.Index('idx_workflow_id', 'workflow_id'),
        db.Index('idx_tenant_id', 'tenant_id'),
        db.Index('idx_action', 'action'),
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
