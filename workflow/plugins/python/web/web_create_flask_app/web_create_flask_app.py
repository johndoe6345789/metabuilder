"""Workflow plugin: create Flask app."""
from flask import Flask


def run(runtime, inputs):
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
    runtime.context["flask_app"] = app

    return {"result": app, "message": "Flask app created"}
