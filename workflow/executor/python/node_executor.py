"""Execute workflow nodes."""


class NodeExecutor:
    """Execute workflow nodes with plugins."""
    def __init__(self, runtime, plugin_registry, input_resolver, loop_executor):
        self.runtime = runtime
        self.plugin_registry = plugin_registry
        self.input_resolver = input_resolver
        self.loop_executor = loop_executor

    def execute_nodes(self, nodes):
        """Execute a list of nodes."""
        for node in nodes:
            self.execute_node(node)

    def execute_node(self, node):
        """Execute a single node."""
        node_type = node.get("type")
        if not node_type:
            self.runtime.logger.error("Workflow node missing type.")
            return None

        when_value = node.get("when")
        if when_value is not None:
            if not self.input_resolver.coerce_bool(self.input_resolver.resolve_binding(when_value)):
                self.runtime.logger.trace("Node %s skipped by condition", node.get("id"))
                return None

        if node_type == "control.loop":
            return self.loop_executor.execute(node)

        plugin = self.plugin_registry.get(node_type)
        if not plugin:
            self.runtime.logger.error("Unknown node type: %s", node_type)
            return None

        inputs = self.input_resolver.resolve_inputs(node.get("inputs", {}))
        self.runtime.logger.debug("Executing node %s", node_type)
        result = plugin(self.runtime, inputs)
        if not isinstance(result, dict):
            result = {"result": result}

        outputs = node.get("outputs", {})
        if outputs:
            for output_name, store_key in outputs.items():
                if output_name in result:
                    self.runtime.store[store_key] = result[output_name]
        else:
            for output_name, value in result.items():
                self.runtime.store[output_name] = value

        return result
