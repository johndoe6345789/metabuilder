"""Workflow plugin: load workflow plugins."""

import os
import json

from ...base import NodeExecutor


class LoadPlugins(NodeExecutor):
    """Load workflow plugins from directory."""

    node_type = "backend.load_plugins"
    category = "backend"
    description = "Load workflow plugins from directory"

    def execute(self, inputs, runtime=None):
        """Load workflow plugins from directory.

        Inputs:
            path: Path to plugins directory
        """
        path = inputs.get("path", "workflow/plugins/python")

        if not os.path.exists(path):
            return {"success": False, "error": f"Path not found: {path}"}

        plugins = {}
        categories = []

        for category in os.listdir(path):
            category_path = os.path.join(path, category)
            if not os.path.isdir(category_path) or category.startswith("_"):
                continue

            categories.append(category)

            for plugin_name in os.listdir(category_path):
                plugin_path = os.path.join(category_path, plugin_name)
                if not os.path.isdir(plugin_path):
                    continue

                package_json = os.path.join(plugin_path, "package.json")
                if os.path.exists(package_json):
                    with open(package_json) as f:
                        metadata = json.load(f)
                        plugin_type = metadata.get("metadata", {}).get("plugin_type")
                        if plugin_type:
                            plugins[plugin_type] = {
                                "path": plugin_path,
                                "metadata": metadata
                            }

        runtime.context["plugins"] = plugins

        return {
            "success": True,
            "categories": categories,
            "plugin_count": len(plugins)
        }
