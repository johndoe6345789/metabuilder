"""Workflow plugin: start Flask server."""

from ...base import NodeExecutor


class WebStartServer(NodeExecutor):
    """Start the Flask web server."""

    node_type = "web.start_server"
    category = "web"
    description = "Start the Flask web server"

    def execute(self, inputs, runtime=None):
        """Start the Flask web server.

        Inputs:
            host: Host address (default: 0.0.0.0)
            port: Port number (default: 8000)
            debug: Enable debug mode (default: False)

        Returns:
            dict: Success indicator (note: this blocks until server stops)
        """
        if runtime is None:
            return {"error": "Runtime context required"}

        app = runtime.context.get("flask_app")
        if not app:
            return {"error": "Flask app not found in context. Run web.create_flask_app first."}

        host = inputs.get("host", "0.0.0.0")
        port = inputs.get("port", 8000)
        debug = inputs.get("debug", False)

        # This will block until the server is stopped
        app.run(host=host, port=port, debug=debug)

        return {"result": "Server stopped"}
