"""Execute workflow loops."""


class LoopExecutor:
    """Execute loop nodes."""
    def __init__(self, runtime, input_resolver):
        self.runtime = runtime
        self.input_resolver = input_resolver
        self.node_executor = None

    def set_node_executor(self, node_executor) -> None:
        """Inject node executor dependency."""
        self.node_executor = node_executor

    def execute(self, node):
        """Run loop body until stop condition."""
        inputs = node.get("inputs", {})
        max_iterations = self.input_resolver.resolve_binding(inputs.get("max_iterations", 1))
        stop_when_raw = inputs.get("stop_when")
        stop_on_raw = inputs.get("stop_on", True)

        try:
            max_iterations = int(max_iterations)
        except (TypeError, ValueError):
            max_iterations = 1

        if self.runtime.context["args"].once:
            max_iterations = min(max_iterations, 1)

        stop_on = self.input_resolver.coerce_bool(self.input_resolver.resolve_binding(stop_on_raw))
        body = node.get("body", [])
        if not isinstance(body, list):
            self.runtime.logger.error("Loop body must be a list of nodes.")
            return None

        iteration = 0
        while iteration < max_iterations:
            iteration += 1
            self.runtime.logger.info("--- Loop iteration %s ---", iteration)
            if not self.node_executor:
                self.runtime.logger.error("Loop executor missing node executor.")
                return None
            self.node_executor.execute_nodes(body)

            if stop_when_raw is not None:
                stop_value = self.input_resolver.resolve_binding(stop_when_raw)
                if self.input_resolver.coerce_bool(stop_value) == stop_on:
                    break

        return None
