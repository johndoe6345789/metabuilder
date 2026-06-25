"""
Plugin registry for discovering and instantiating workflow plugins.

Plugins export NODE_TYPE, CATEGORY, DESCRIPTION, and impl - no side effects.
The registry handles lazy instantiation of executors when needed.
"""

import importlib
import pkgutil
from pathlib import Path
from typing import Any, Callable, Dict, Optional

from .base import NodeExecutor
from .factory import create_plugin


class PluginRegistry:
    """Registry for workflow plugins with lazy instantiation."""

    def __init__(self):
        self._plugins: Dict[str, dict] = {}  # node_type -> plugin metadata
        self._executors: Dict[str, NodeExecutor] = {}  # node_type -> executor (lazy)

    def register(
        self,
        node_type: str,
        category: str,
        description: str,
        impl: Callable[[Dict[str, Any], Any], Dict[str, Any]],
    ) -> None:
        """Register a plugin without instantiating it."""
        self._plugins[node_type] = {
            "node_type": node_type,
            "category": category,
            "description": description,
            "impl": impl,
        }

    def get_executor(self, node_type: str) -> Optional[NodeExecutor]:
        """Get or create an executor for a plugin (lazy instantiation)."""
        if node_type in self._executors:
            return self._executors[node_type]

        if node_type not in self._plugins:
            return None

        plugin = self._plugins[node_type]
        executor = create_plugin(
            plugin["node_type"],
            plugin["category"],
            plugin["description"],
            plugin["impl"],
        )
        self._executors[node_type] = executor
        return executor

    def run(
        self, node_type: str, runtime: Any, inputs: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Run a plugin by node type."""
        executor = self.get_executor(node_type)
        if executor is None:
            return {"error": f"Unknown plugin: {node_type}"}
        return executor.run(runtime, inputs)

    def list_plugins(self) -> Dict[str, dict]:
        """List all registered plugins."""
        return {
            node_type: {
                "node_type": p["node_type"],
                "category": p["category"],
                "description": p["description"],
            }
            for node_type, p in self._plugins.items()
        }

    def discover(self, package_path: str = None) -> None:
        """
        Discover and register all plugins from the plugins package.

        Scans for modules with NODE_TYPE, CATEGORY, DESCRIPTION, and impl.
        """
        if package_path is None:
            package_path = str(Path(__file__).parent)

        # Walk through all subdirectories
        for category_dir in Path(package_path).iterdir():
            if not category_dir.is_dir() or category_dir.name.startswith("_"):
                continue

            # Skip non-plugin directories
            if category_dir.name in ("__pycache__",):
                continue

            # Each subdirectory in category is a plugin
            for plugin_dir in category_dir.iterdir():
                if not plugin_dir.is_dir() or plugin_dir.name.startswith("_"):
                    continue

                # Look for the plugin module
                plugin_file = plugin_dir / f"{plugin_dir.name}.py"
                if not plugin_file.exists():
                    continue

                try:
                    # Import the module
                    module_name = f"workflow.plugins.python.{category_dir.name}.{plugin_dir.name}.{plugin_dir.name}"
                    module = importlib.import_module(module_name)

                    # Check for required exports
                    if hasattr(module, "NODE_TYPE") and hasattr(module, "impl"):
                        self.register(
                            node_type=module.NODE_TYPE,
                            category=getattr(module, "CATEGORY", category_dir.name),
                            description=getattr(module, "DESCRIPTION", ""),
                            impl=module.impl,
                        )
                except Exception:
                    # Skip plugins that fail to load
                    pass


# Global registry instance
registry = PluginRegistry()


def get_registry() -> PluginRegistry:
    """Get the global plugin registry."""
    return registry


def run_plugin(
    node_type: str, runtime: Any, inputs: Dict[str, Any]
) -> Dict[str, Any]:
    """Convenience function to run a plugin."""
    return registry.run(node_type, runtime, inputs)
