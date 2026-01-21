"""Build workflow engine with dependencies."""
from .engine import WorkflowEngine
from .input_resolver import InputResolver
from .loop_executor import LoopExecutor
from .node_executor import NodeExecutor
from .plugin_registry import PluginRegistry, load_plugin_map
from .runtime import WorkflowRuntime
from .tool_runner import ToolRunner


def build_workflow_engine(workflow_config: dict, context: dict, logger):
    """Assemble workflow engine dependencies."""
    runtime = WorkflowRuntime(context=context, store={}, tool_runner=None, logger=logger)
    # Only create ToolRunner if tool_map and msgs are provided (needed for AI workflows)
    if "tool_map" in context and "msgs" in context:
        tool_runner = ToolRunner(context["tool_map"], context["msgs"], logger)
        runtime.tool_runner = tool_runner

    plugin_registry = PluginRegistry(load_plugin_map())
    input_resolver = InputResolver(runtime.store)
    loop_executor = LoopExecutor(runtime, input_resolver)
    node_executor = NodeExecutor(runtime, plugin_registry, input_resolver, loop_executor)
    loop_executor.set_node_executor(node_executor)

    return WorkflowEngine(workflow_config, node_executor, logger, runtime, plugin_registry)
