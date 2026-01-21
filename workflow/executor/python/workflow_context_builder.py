"""Build workflow runtime context."""
import os

DEFAULT_MODEL = "openai/gpt-4o"


def resolve_model_name(prompt: dict) -> str:
    """Resolve model name from env or prompt."""
    return os.environ.get("LLM_MODEL", prompt.get("model", DEFAULT_MODEL))


def build_workflow_context(parts: dict) -> dict:
    """Build the workflow context dict."""
    context = dict(parts)
    # Only resolve model if prompt is available, otherwise use default
    if "prompt" in parts:
        prompt = parts["prompt"]
        context["model_name"] = resolve_model_name(prompt)
    else:
        # Workflow plugins will load prompt, model will be resolved then
        context["model_name"] = resolve_model_name({})
    return context
