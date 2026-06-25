"""Workflow plugin: register Flask route."""

from ...base import NodeExecutor


class WebRegisterRoute(NodeExecutor):
    """Register a route on a Flask application."""

    node_type = "web.register_route"
    category = "web"
    description = "Register a route on a Flask application"

    def execute(self, inputs, runtime=None):
        """Register a route on the Flask app.

        Inputs:
            path: URL path pattern (e.g., "/v1/<namespace>/<name>/blob")
            methods: List of HTTP methods (default: ["GET"])
            workflow: Workflow name to execute for this route
            endpoint: Optional endpoint name (default: workflow name)

        Returns:
            dict: Success indicator
        """
        if runtime is None:
            return {"error": "Runtime context required"}

        app = runtime.context.get("flask_app")
        if not app:
            return {"error": "Flask app not found in context. Run web.create_flask_app first."}

        path = inputs.get("path")
        if not path:
            return {"error": "Missing required parameter: path"}

        methods = inputs.get("methods", ["GET"])
        workflow_name = inputs.get("workflow")
        endpoint = inputs.get("endpoint", workflow_name)

        if not workflow_name:
            return {"error": "Missing required parameter: workflow"}

        # Create route handler that executes the workflow
        def route_handler(**path_params):
            # Import here to avoid circular dependency
            from flask import request

            # Get workflow loader from runtime
            workflow_loader = runtime.context.get("workflow_loader")
            if not workflow_loader:
                return {"error": "Workflow loader not found in context"}, 500

            # Execute workflow with request context
            return workflow_loader.execute_workflow_for_request(
                workflow_name,
                request,
                {"path_params": path_params}
            )

        # Register the route
        app.add_url_rule(
            path,
            endpoint=endpoint,
            view_func=route_handler,
            methods=methods
        )

        return {
            "result": f"Registered {methods} {path} -> {workflow_name}",
            "path": path,
            "methods": methods,
            "workflow": workflow_name
        }
