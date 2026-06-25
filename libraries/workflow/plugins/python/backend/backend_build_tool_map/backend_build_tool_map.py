"""Workflow plugin: build tool map for function dispatch."""

from ...base import NodeExecutor


class BuildToolMap(NodeExecutor):
    """Build a map from tool names to their handlers."""

    node_type = "backend.build_tool_map"
    category = "backend"
    description = "Build tool map for function dispatch"

    def execute(self, inputs, runtime=None):
        """Build a map from tool names to their handlers.

        This reads plugins from context and builds a dispatch map.
        """
        plugins = runtime.context.get("plugins", {})

        tool_map = {}
        for plugin_type, plugin_info in plugins.items():
            # Map plugin_type (e.g., "math.add") to handler info
            tool_map[plugin_type] = plugin_info

        runtime.context["tool_map"] = tool_map

        return {"success": True, "tool_count": len(tool_map)}
