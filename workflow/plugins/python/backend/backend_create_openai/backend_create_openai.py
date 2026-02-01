"""Workflow plugin: create OpenAI client."""

import os

from ...base import NodeExecutor


class CreateOpenAI(NodeExecutor):
    """Create an OpenAI client and store in runtime context."""

    node_type = "backend.create_openai"
    category = "backend"
    description = "Create OpenAI client for AI operations"

    def execute(self, inputs, runtime=None):
        """Create an OpenAI client and store in runtime context.

        Inputs:
            api_key: OpenAI API key (defaults to OPENAI_API_KEY env var)
            model: Model name (default: gpt-4)
        """
        try:
            from openai import OpenAI
        except ImportError:
            return {"success": False, "error": "openai package not installed"}

        api_key = inputs.get("api_key") or os.getenv("OPENAI_API_KEY")
        model = inputs.get("model", "gpt-4")

        if not api_key:
            return {"success": False, "error": "No API key provided"}

        client = OpenAI(api_key=api_key)

        runtime.context["client"] = client
        runtime.context["model_name"] = model

        return {"success": True, "model": model}
