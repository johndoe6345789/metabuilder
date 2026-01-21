"""Workflow plugin: create GitHub client."""
import os


def run(runtime, inputs):
    """Create a GitHub client and store in runtime context.

    Inputs:
        token: GitHub token (defaults to GITHUB_TOKEN env var)
    """
    try:
        from github import Github
    except ImportError:
        return {"success": False, "error": "PyGithub package not installed"}

    token = inputs.get("token") or os.getenv("GITHUB_TOKEN")

    if not token:
        return {"success": False, "error": "No token provided"}

    client = Github(token)

    runtime.context["github"] = client

    return {"success": True}
