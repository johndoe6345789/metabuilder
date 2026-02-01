"""Workflow plugin: create Flask app."""

from flask import Flask

from ...base import NodeExecutor


class WebCreateFlaskApp(NodeExecutor):
    """Create a Flask application instance."""

    node_type = "web.create_flask_app"
    category = "web"
    description = "Create a Flask application instance"

    def execute(self, inputs, runtime=None):
        """Create a Flask application instance.

        Inputs:
            name: Application name (default: __name__)
            config: Dictionary of Flask configuration options

        Returns:
            dict: Contains the Flask app in result
        """
        name = inputs.get("name", "__main__")
        config = inputs.get("config", {})

        app = Flask(name)

        # Apply configuration
        for key, value in config.items():
            app.config[key] = value

        # Store app in runtime context for other plugins to use
        if runtime is not None:
            runtime.context["flask_app"] = app

        return {"result": app, "message": "Flask app created"}
