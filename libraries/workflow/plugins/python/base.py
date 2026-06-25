"""
Base classes and types for workflow plugins.

This module provides the class-based plugin architecture that mirrors
the TypeScript implementation for consistency across languages.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Callable
from enum import Enum
import time


class NodeStatus(Enum):
    """Status of node execution."""
    SUCCESS = "success"
    ERROR = "error"
    SKIPPED = "skipped"
    PENDING = "pending"


@dataclass
class NodeResult:
    """Result of a node execution."""
    status: NodeStatus
    output: Optional[Any] = None
    error: Optional[str] = None
    error_code: Optional[str] = None
    timestamp: int = field(default_factory=lambda: int(time.time() * 1000))
    duration: Optional[int] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        result = {
            "status": self.status.value,
            "timestamp": self.timestamp,
        }
        if self.output is not None:
            result["output"] = self.output
        if self.error is not None:
            result["error"] = self.error
        if self.error_code is not None:
            result["errorCode"] = self.error_code
        if self.duration is not None:
            result["duration"] = self.duration
        return result


@dataclass
class ValidationResult:
    """Result of node validation."""
    valid: bool
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)


@dataclass
class WorkflowNode:
    """Workflow node definition."""
    id: str
    name: str
    node_type: str
    parameters: Dict[str, Any] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "WorkflowNode":
        """Create from dictionary."""
        return cls(
            id=data.get("id", ""),
            name=data.get("name", ""),
            node_type=data.get("nodeType", data.get("node_type", "")),
            parameters=data.get("parameters", {}),
            metadata=data.get("metadata", {}),
        )


@dataclass
class WorkflowContext:
    """Context for workflow execution."""
    execution_id: str
    tenant_id: str
    user_id: str
    trigger_data: Dict[str, Any] = field(default_factory=dict)
    variables: Dict[str, Any] = field(default_factory=dict)
    secrets: Dict[str, str] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "WorkflowContext":
        """Create from dictionary."""
        return cls(
            execution_id=data.get("executionId", data.get("execution_id", "")),
            tenant_id=data.get("tenantId", data.get("tenant_id", "")),
            user_id=data.get("userId", data.get("user_id", "")),
            trigger_data=data.get("triggerData", data.get("trigger_data", {})),
            variables=data.get("variables", {}),
            secrets=data.get("secrets", {}),
        )


class ExecutionState(dict):
    """State dictionary for workflow execution with variable storage."""

    @property
    def variables(self) -> Dict[str, Any]:
        """Get or create variables dict."""
        if "variables" not in self:
            self["variables"] = {}
        return self["variables"]

    @variables.setter
    def variables(self, value: Dict[str, Any]) -> None:
        self["variables"] = value


class NodeExecutor(ABC):
    """
    Abstract base class for node executors.

    All workflow plugins should inherit from this class and implement
    the execute() method. The run() method provides legacy compatibility.
    """

    node_type: str = ""
    category: str = ""
    description: str = ""

    @abstractmethod
    def execute(self, inputs: Dict[str, Any], runtime: Any = None) -> Dict[str, Any]:
        """
        Execute the node logic.

        Args:
            inputs: Input parameters dictionary
            runtime: Optional runtime context (for advanced use)

        Returns:
            Dict with 'result' key on success, or 'error' key on failure
        """
        pass

    def validate(self, inputs: Dict[str, Any]) -> ValidationResult:
        """
        Validate inputs.

        Override this method to add custom validation logic.
        Default implementation returns valid=True.

        Args:
            inputs: Input parameters to validate

        Returns:
            ValidationResult with valid flag and any errors/warnings
        """
        return ValidationResult(valid=True)

    def run(self, runtime: Any, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Legacy interface - calls execute().

        Args:
            runtime: Runtime context (passed through)
            inputs: Input parameters

        Returns:
            Dict with result or error
        """
        return self.execute(inputs, runtime)

    def _resolve(self, value: Any, inputs: Dict[str, Any]) -> Any:
        """
        Resolve template expressions in values.

        Handles {{variable}} syntax for dynamic values.
        """
        if isinstance(value, str) and value.startswith("{{") and value.endswith("}}"):
            expr = value[2:-2].strip()
            return self._get_nested(inputs, expr)
        return value

    def _get_nested(self, data: Dict[str, Any], path: str) -> Any:
        """Get nested value from dict using dot notation."""
        parts = path.split(".")
        current = data

        for part in parts:
            if isinstance(current, dict):
                current = current.get(part)
            elif hasattr(current, part):
                current = getattr(current, part)
            else:
                return None

            if current is None:
                return None

        return current




