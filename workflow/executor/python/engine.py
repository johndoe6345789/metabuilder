"""Workflow engine runner for n8n format."""
from .workflow_adapter import WorkflowAdapter, is_n8n_workflow


class WorkflowEngine:
    """Run n8n workflow configs (breaking change: legacy format removed)."""
    def __init__(self, workflow_config, node_executor, logger, runtime=None, plugin_registry=None):
        self.workflow_config = workflow_config or {}
        self.node_executor = node_executor
        self.logger = logger
        self.runtime = runtime
        self.plugin_registry = plugin_registry

        # Create adapter if we have runtime and plugin registry
        if runtime and plugin_registry:
            self.adapter = WorkflowAdapter(node_executor, runtime, plugin_registry)
        else:
            self.adapter = None

    def execute(self):
        """Execute the n8n workflow config."""
        # Enforce n8n format only
        if not is_n8n_workflow(self.workflow_config):
            self.logger.error("Legacy workflow format is no longer supported. Please migrate to n8n schema.")
            raise ValueError("Only n8n workflow format is supported")

        if self.adapter:
            self.adapter.execute(self.workflow_config)
        else:
            self.logger.error("Workflow engine requires runtime and plugin_registry for n8n execution")
            raise RuntimeError("Cannot execute n8n workflow without runtime and plugin_registry")
