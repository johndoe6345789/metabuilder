#!/usr/bin/env python3
"""
Example workflow scenarios for comprehensive validation testing.

This module provides realistic workflow examples demonstrating:
1. Authentication workflows with validation
2. Data processing pipelines
3. Error handling patterns
4. Complex multi-node workflows
5. Edge cases and problematic patterns

Each example includes validation test cases.
"""

import pytest
import json
import sys
from pathlib import Path
from typing import Dict, Any

sys.path.insert(0, str(Path(__file__).parent.parent / 'backend'))

from workflow_loader_v2 import WorkflowLoaderV2


@pytest.fixture
def temp_workflows_dir(tmp_path):
    """Create temporary workflows directory."""
    workflows_dir = tmp_path / "workflows"
    workflows_dir.mkdir(exist_ok=True)
    return workflows_dir


@pytest.fixture
def base_config():
    """Base Flask configuration."""
    return {
        "DEBUG": False,
        "TESTING": True,
        "DATABASE_URL": "sqlite:///:memory:",
    }


@pytest.fixture
def loader_v2(temp_workflows_dir, base_config):
    """Create WorkflowLoaderV2 instance."""
    return WorkflowLoaderV2(temp_workflows_dir, base_config)


# ============================================================================
# EXAMPLE 1: AUTHENTICATION WORKFLOW
# ============================================================================

AUTH_LOGIN_WORKFLOW = {
    "id": "auth_login_001",
    "name": "Authenticate User",
    "version": "1.0.0",
    "tenantId": "acme",
    "active": True,
    "nodes": [
        {
            "id": "parse_body",
            "name": "Parse Body",
            "type": "packagerepo.parse_json",
            "typeVersion": 1,
            "position": [100, 100],
            "parameters": {
                "input": "$request.body",
                "out": "credentials"
            }
        },
        {
            "id": "validate_fields",
            "name": "Validate Fields",
            "type": "logic.if",
            "typeVersion": 1,
            "position": [300, 100],
            "parameters": {
                "condition": "$credentials.username == null || $credentials.password == null",
                "then": "error_invalid_request",
                "else": "verify_password"
            }
        },
        {
            "id": "verify_password",
            "name": "Verify Password",
            "type": "packagerepo.auth_verify_password",
            "typeVersion": 1,
            "position": [500, 100],
            "parameters": {
                "username": "$credentials.username",
                "password": "$credentials.password",
                "out": "user"
            }
        },
        {
            "id": "check_verified",
            "name": "Check Verified",
            "type": "logic.if",
            "typeVersion": 1,
            "position": [700, 100],
            "parameters": {
                "condition": "$user == null",
                "then": "error_unauthorized",
                "else": "generate_token"
            }
        },
        {
            "id": "generate_token",
            "name": "Generate Token",
            "type": "packagerepo.auth_generate_jwt",
            "typeVersion": 1,
            "position": [900, 100],
            "parameters": {
                "subject": "$user.username",
                "scopes": "$user.scopes",
                "expires_in": 86400,
                "out": "token"
            }
        },
        {
            "id": "respond_success",
            "name": "Respond Success",
            "type": "packagerepo.respond_json",
            "typeVersion": 1,
            "position": [1100, 100],
            "parameters": {
                "body": {
                    "ok": True,
                    "token": "$token",
                    "username": "$user.username",
                    "scopes": "$user.scopes",
                    "expires_in": 86400
                },
                "status": 200
            }
        },
        {
            "id": "error_invalid_request",
            "name": "Error Invalid Request",
            "type": "packagerepo.respond_error",
            "typeVersion": 1,
            "position": [300, 300],
            "parameters": {
                "message": "Missing username or password",
                "status": 400
            }
        },
        {
            "id": "error_unauthorized",
            "name": "Error Unauthorized",
            "type": "packagerepo.respond_error",
            "typeVersion": 1,
            "position": [700, 300],
            "parameters": {
                "message": "Invalid username or password",
                "status": 401
            }
        }
    ],
    "connections": {
        "Parse Body": {
            "main": {
                "0": [{"node": "Validate Fields", "type": "main", "index": 0}]
            }
        },
        "Validate Fields": {
            "main": {
                "0": [
                    {"node": "Error Invalid Request", "type": "main", "index": 0},
                    {"node": "Verify Password", "type": "main", "index": 0}
                ]
            }
        },
        "Verify Password": {
            "main": {
                "0": [{"node": "Check Verified", "type": "main", "index": 0}]
            }
        },
        "Check Verified": {
            "main": {
                "0": [
                    {"node": "Error Unauthorized", "type": "main", "index": 0},
                    {"node": "Generate Token", "type": "main", "index": 0}
                ]
            }
        },
        "Generate Token": {
            "main": {
                "0": [{"node": "Respond Success", "type": "main", "index": 0}]
            }
        }
    },
    "variables": {
        "max_attempts": {"type": "number", "defaultValue": 3},
        "session_timeout": {"type": "number", "defaultValue": 3600}
    },
    "settings": {
        "timezone": "UTC",
        "executionTimeout": 30000,
        "saveExecutionProgress": True
    }
}


class TestAuthenticationWorkflow:
    """Test authentication workflow validation."""

    def test_auth_workflow_valid(self, loader_v2):
        """Test authentication workflow is valid."""
        is_valid, errors = loader_v2.validate_workflow(AUTH_LOGIN_WORKFLOW, strict=False)

        critical_errors = [e for e in errors if e["type"] == "error"]
        assert len(critical_errors) == 0

    def test_auth_workflow_has_required_fields(self, loader_v2):
        """Test auth workflow has all required fields."""
        is_valid, errors = loader_v2.validate_workflow(AUTH_LOGIN_WORKFLOW)

        id_errors = [e for e in errors if "id" in e["field"].lower()]
        assert len(id_errors) == 0

    def test_auth_workflow_has_all_nodes(self, loader_v2):
        """Test auth workflow has all expected nodes."""
        is_valid, errors = loader_v2.validate_workflow(AUTH_LOGIN_WORKFLOW, strict=False)

        assert len(AUTH_LOGIN_WORKFLOW["nodes"]) == 8

    def test_auth_workflow_connections_valid(self, loader_v2):
        """Test auth workflow connections are valid."""
        is_valid, errors = loader_v2.validate_workflow(AUTH_LOGIN_WORKFLOW, strict=False)

        conn_errors = [e for e in errors if "connection" in e.get("message", "").lower()]
        # Should have minimal connection warnings
        assert len(conn_errors) <= 2


# ============================================================================
# EXAMPLE 2: DATA PROCESSING PIPELINE
# ============================================================================

DATA_PROCESSING_WORKFLOW = {
    "id": "data_processing_001",
    "name": "Data Processing Pipeline",
    "version": "2.0.0",
    "tenantId": "analytics",
    "active": True,
    "nodes": [
        {
            "id": "trigger",
            "name": "File Upload Trigger",
            "type": "metabuilder.trigger",
            "typeVersion": 1,
            "position": [100, 100],
            "parameters": {
                "triggerType": "webhook"
            }
        },
        {
            "id": "extract_file",
            "name": "Extract File Data",
            "type": "transform.extract",
            "typeVersion": 1,
            "position": [300, 100],
            "parameters": {
                "source": "$request.file",
                "format": "csv",
                "out": "rows"
            }
        },
        {
            "id": "validate_rows",
            "name": "Validate Rows",
            "type": "logic.loop",
            "typeVersion": 1,
            "position": [500, 100],
            "parameters": {
                "array": "$rows",
                "process": "validate_row"
            }
        },
        {
            "id": "validate_row",
            "name": "Validate Row",
            "type": "logic.if",
            "typeVersion": 1,
            "position": [500, 250],
            "parameters": {
                "condition": "$item.id != null && $item.value != null",
                "then": "transform_row",
                "else": "skip_row"
            }
        },
        {
            "id": "transform_row",
            "name": "Transform Row",
            "type": "transform.map",
            "typeVersion": 1,
            "position": [700, 250],
            "parameters": {
                "input": "$item",
                "mapping": {
                    "id": "$item.id",
                    "processed_value": "$item.value * 1.1",
                    "timestamp": "$now"
                },
                "out": "transformed"
            }
        },
        {
            "id": "skip_row",
            "name": "Skip Row",
            "type": "transform.skip",
            "typeVersion": 1,
            "position": [700, 350],
            "parameters": {
                "reason": "Invalid row data"
            }
        },
        {
            "id": "batch_insert",
            "name": "Batch Insert",
            "type": "database.insert",
            "typeVersion": 1,
            "position": [900, 100],
            "parameters": {
                "table": "processed_data",
                "records": "$transformed_rows",
                "out": "insert_result"
            }
        },
        {
            "id": "respond_success",
            "name": "Respond Success",
            "type": "packagerepo.respond_json",
            "typeVersion": 1,
            "position": [1100, 100],
            "parameters": {
                "body": {
                    "ok": True,
                    "processed": "$insert_result.count",
                    "status": "completed"
                },
                "status": 200
            }
        }
    ],
    "connections": {
        "File Upload Trigger": {
            "main": {
                "0": [{"node": "Extract File Data", "type": "main", "index": 0}]
            }
        },
        "Extract File Data": {
            "main": {
                "0": [{"node": "Validate Rows", "type": "main", "index": 0}]
            }
        },
        "Validate Rows": {
            "main": {
                "0": [{"node": "Batch Insert", "type": "main", "index": 0}]
            }
        }
    },
    "variables": {
        "batch_size": {"type": "number", "defaultValue": 1000},
        "max_file_size": {"type": "number", "defaultValue": 104857600},
        "allowed_formats": {"type": "array", "defaultValue": ["csv", "json"]}
    },
    "settings": {
        "timezone": "UTC",
        "executionTimeout": 300000,
        "saveExecutionProgress": True,
        "saveDataSuccessExecution": "all"
    }
}


class TestDataProcessingWorkflow:
    """Test data processing pipeline workflow validation."""

    def test_data_processing_workflow_valid(self, loader_v2):
        """Test data processing workflow is valid."""
        is_valid, errors = loader_v2.validate_workflow(DATA_PROCESSING_WORKFLOW, strict=False)

        critical_errors = [e for e in errors if e["type"] == "error"]
        assert len(critical_errors) == 0

    def test_data_processing_has_variables(self, loader_v2):
        """Test data processing workflow has variables."""
        assert "variables" in DATA_PROCESSING_WORKFLOW
        assert "batch_size" in DATA_PROCESSING_WORKFLOW["variables"]

    def test_data_processing_nodes_count(self, loader_v2):
        """Test data processing workflow has expected node count."""
        assert len(DATA_PROCESSING_WORKFLOW["nodes"]) == 8


# ============================================================================
# EXAMPLE 3: WORKFLOW WITH PROBLEMATIC PATTERNS
# ============================================================================

PROBLEMATIC_WORKFLOW_NESTING = {
    "id": "problematic_001",
    "name": "Problematic Workflow",
    "nodes": [
        {
            "id": "node-1",
            "name": "Bad Node",
            "type": "packagerepo.parse_json",
            "typeVersion": 1,
            "position": [100, 100],
            "parameters": {
                "input": "$request.body",
                "name": "This should not be here",  # Node attribute in params
                "position": [100, 100]  # Node attribute in params
            }
        }
    ],
    "connections": {}
}


class TestProblematicWorkflows:
    """Test detection of problematic workflow patterns."""

    def test_nesting_issue_detected(self, loader_v2):
        """Test nesting issues are properly detected."""
        is_valid, errors = loader_v2.validate_workflow(PROBLEMATIC_WORKFLOW_NESTING)

        assert not is_valid
        nesting_errors = [
            e for e in errors if "nesting" in e["message"].lower()
        ]
        assert len(nesting_errors) > 0

    def test_missing_required_field_in_problematic(self, loader_v2):
        """Test missing required fields are detected."""
        workflow = PROBLEMATIC_WORKFLOW_NESTING.copy()
        del workflow["id"]

        is_valid, errors = loader_v2.validate_workflow(workflow)
        assert not is_valid


# ============================================================================
# EXAMPLE 4: WEBHOOK LISTENER WORKFLOW
# ============================================================================

WEBHOOK_WORKFLOW = {
    "id": "webhook_listener_001",
    "name": "Webhook Listener",
    "version": "1.0.0",
    "tenantId": "integration",
    "active": True,
    "nodes": [
        {
            "id": "webhook_trigger",
            "name": "Webhook Trigger",
            "type": "metabuilder.trigger",
            "typeVersion": 1,
            "position": [100, 100],
            "parameters": {
                "triggerType": "webhook",
                "method": "POST",
                "path": "/webhooks/github"
            }
        },
        {
            "id": "parse_payload",
            "name": "Parse Webhook Payload",
            "type": "packagerepo.parse_json",
            "typeVersion": 1,
            "position": [300, 100],
            "parameters": {
                "input": "$request.body",
                "out": "payload"
            }
        },
        {
            "id": "verify_signature",
            "name": "Verify GitHub Signature",
            "type": "security.verify_signature",
            "typeVersion": 1,
            "position": [500, 100],
            "parameters": {
                "payload": "$payload",
                "signature": "$request.headers['x-hub-signature-256']",
                "secret": "$config.github_webhook_secret",
                "out": "is_valid"
            }
        },
        {
            "id": "check_signature",
            "name": "Check Signature Valid",
            "type": "logic.if",
            "typeVersion": 1,
            "position": [700, 100],
            "parameters": {
                "condition": "$is_valid == true",
                "then": "process_event",
                "else": "reject_unauthorized"
            }
        },
        {
            "id": "process_event",
            "name": "Process Event",
            "type": "workflow.trigger",
            "typeVersion": 1,
            "position": [900, 100],
            "parameters": {
                "event_type": "$payload.action",
                "event_data": "$payload"
            }
        },
        {
            "id": "respond_ok",
            "name": "Respond OK",
            "type": "packagerepo.respond_json",
            "typeVersion": 1,
            "position": [1100, 100],
            "parameters": {
                "body": {"status": "received"},
                "status": 202
            }
        },
        {
            "id": "reject_unauthorized",
            "name": "Reject Unauthorized",
            "type": "packagerepo.respond_error",
            "typeVersion": 1,
            "position": [700, 300],
            "parameters": {
                "message": "Invalid signature",
                "status": 401
            }
        }
    ],
    "connections": {
        "Webhook Trigger": {
            "main": {
                "0": [{"node": "Parse Webhook Payload", "type": "main", "index": 0}]
            }
        },
        "Parse Webhook Payload": {
            "main": {
                "0": [{"node": "Verify GitHub Signature", "type": "main", "index": 0}]
            }
        },
        "Verify GitHub Signature": {
            "main": {
                "0": [{"node": "Check Signature Valid", "type": "main", "index": 0}]
            }
        },
        "Check Signature Valid": {
            "main": {
                "0": [
                    {"node": "Process Event", "type": "main", "index": 0},
                    {"node": "Reject Unauthorized", "type": "main", "index": 0}
                ]
            }
        },
        "Process Event": {
            "main": {
                "0": [{"node": "Respond OK", "type": "main", "index": 0}]
            }
        }
    },
    "variables": {
        "webhook_url": {"type": "string"},
        "webhook_secret": {"type": "string"}
    },
    "settings": {
        "timezone": "UTC",
        "executionTimeout": 60000
    }
}


class TestWebhookWorkflow:
    """Test webhook listener workflow validation."""

    def test_webhook_workflow_valid(self, loader_v2):
        """Test webhook workflow is valid."""
        is_valid, errors = loader_v2.validate_workflow(WEBHOOK_WORKFLOW, strict=False)

        critical_errors = [e for e in errors if e["type"] == "error"]
        assert len(critical_errors) == 0

    def test_webhook_has_trigger_node(self, loader_v2):
        """Test webhook workflow has trigger node."""
        nodes = WEBHOOK_WORKFLOW["nodes"]
        trigger_nodes = [n for n in nodes if n["type"] == "metabuilder.trigger"]
        assert len(trigger_nodes) > 0

    def test_webhook_security_node(self, loader_v2):
        """Test webhook workflow includes security validation."""
        nodes = WEBHOOK_WORKFLOW["nodes"]
        security_nodes = [
            n for n in nodes if "verify" in n["name"].lower() or "signature" in n["name"].lower()
        ]
        assert len(security_nodes) > 0


# ============================================================================
# EXAMPLE 5: ERROR HANDLING WORKFLOW
# ============================================================================

ERROR_HANDLING_WORKFLOW = {
    "id": "error_handling_001",
    "name": "Error Handling Example",
    "version": "1.0.0",
    "tenantId": "production",
    "active": True,
    "nodes": [
        {
            "id": "trigger",
            "name": "Trigger",
            "type": "metabuilder.trigger",
            "typeVersion": 1,
            "position": [100, 100],
            "parameters": {}
        },
        {
            "id": "try_operation",
            "name": "Try Operation",
            "type": "workflow.try_catch",
            "typeVersion": 1,
            "position": [300, 100],
            "parameters": {
                "try": "perform_task",
                "catch": "handle_error",
                "finally": "cleanup"
            }
        },
        {
            "id": "perform_task",
            "name": "Perform Task",
            "type": "http.request",
            "typeVersion": 1,
            "position": [500, 100],
            "parameters": {
                "url": "$config.api_url",
                "method": "POST",
                "body": "$request.body",
                "out": "api_response"
            }
        },
        {
            "id": "handle_error",
            "name": "Handle Error",
            "type": "error.handler",
            "typeVersion": 1,
            "position": [500, 300],
            "parameters": {
                "log": True,
                "alert": True,
                "retry": True,
                "max_retries": 3
            }
        },
        {
            "id": "cleanup",
            "name": "Cleanup Resources",
            "type": "workflow.cleanup",
            "typeVersion": 1,
            "position": [700, 200],
            "parameters": {
                "resources": ["$api_response", "$temp_data"]
            }
        },
        {
            "id": "respond_success",
            "name": "Respond Success",
            "type": "packagerepo.respond_json",
            "typeVersion": 1,
            "position": [900, 100],
            "parameters": {
                "body": {
                    "ok": True,
                    "result": "$api_response.body"
                },
                "status": 200
            }
        }
    ],
    "connections": {
        "Trigger": {
            "main": {
                "0": [{"node": "Try Operation", "type": "main", "index": 0}]
            }
        },
        "Try Operation": {
            "main": {
                "0": [
                    {"node": "Perform Task", "type": "main", "index": 0},
                    {"node": "Handle Error", "type": "error", "index": 0}
                ]
            },
            "error": {
                "0": [{"node": "Handle Error", "type": "main", "index": 0}]
            }
        },
        "Perform Task": {
            "main": {
                "0": [{"node": "Cleanup", "type": "main", "index": 0}]
            }
        },
        "Handle Error": {
            "main": {
                "0": [{"node": "Cleanup", "type": "main", "index": 0}]
            }
        },
        "Cleanup": {
            "main": {
                "0": [{"node": "Respond Success", "type": "main", "index": 0}]
            }
        }
    },
    "variables": {
        "retry_delay": {"type": "number", "defaultValue": 1000},
        "max_timeout": {"type": "number", "defaultValue": 30000}
    },
    "settings": {
        "timezone": "UTC",
        "executionTimeout": 60000,
        "saveExecutionProgress": True,
        "saveDataErrorExecution": "all"
    }
}


class TestErrorHandlingWorkflow:
    """Test error handling workflow validation."""

    def test_error_handling_workflow_valid(self, loader_v2):
        """Test error handling workflow is valid."""
        is_valid, errors = loader_v2.validate_workflow(ERROR_HANDLING_WORKFLOW, strict=False)

        critical_errors = [e for e in errors if e["type"] == "error"]
        assert len(critical_errors) == 0

    def test_error_handling_has_error_outputs(self, loader_v2):
        """Test error handling workflow includes error connections."""
        connections = ERROR_HANDLING_WORKFLOW["connections"]
        has_error_output = any(
            "error" in outputs for outputs in connections.values()
        )
        assert has_error_output


# ============================================================================
# COMPARISON AND REGRESSION TESTS
# ============================================================================

class TestWorkflowComparison:
    """Test comparing different workflow patterns."""

    def test_simple_vs_complex_workflows(self, loader_v2):
        """Test validation works for both simple and complex workflows."""
        simple = {
            "id": "simple",
            "name": "Simple",
            "nodes": [
                {
                    "id": "node-1",
                    "name": "Node",
                    "type": "metabuilder.trigger",
                    "typeVersion": 1,
                    "position": [100, 100],
                    "parameters": {}
                }
            ],
            "connections": {}
        }

        simple_valid, simple_errors = loader_v2.validate_workflow(simple, strict=False)
        complex_valid, complex_errors = loader_v2.validate_workflow(
            AUTH_LOGIN_WORKFLOW, strict=False
        )

        assert isinstance(simple_valid, bool)
        assert isinstance(complex_valid, bool)

    def test_all_example_workflows_valid(self, loader_v2):
        """Test all example workflows are valid."""
        workflows = [
            AUTH_LOGIN_WORKFLOW,
            DATA_PROCESSING_WORKFLOW,
            WEBHOOK_WORKFLOW,
            ERROR_HANDLING_WORKFLOW
        ]

        for workflow in workflows:
            is_valid, errors = loader_v2.validate_workflow(workflow, strict=False)
            critical_errors = [e for e in errors if e["type"] == "error"]
            assert len(critical_errors) == 0, f"Workflow {workflow['id']} has errors: {critical_errors}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
