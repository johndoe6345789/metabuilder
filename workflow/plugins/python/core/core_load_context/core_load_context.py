"""Workflow plugin: load SDLC context."""

import os
import logging

from ...base import NodeExecutor

logger = logging.getLogger("metabuilder")


class CoreLoadContext(NodeExecutor):
    """Load SDLC context into the workflow store."""

    node_type = "core.load_context"
    category = "core"
    description = "Load SDLC context from ROADMAP.md and GitHub issues/PRs"

    def execute(self, inputs, runtime=None):
        """Load SDLC context into the workflow store."""
        gh = runtime.context.get("gh")
        msgs = runtime.context.get("msgs", {})

        sdlc_context = ""

        # Load ROADMAP.md if it exists
        if os.path.exists("ROADMAP.md"):
            with open("ROADMAP.md", "r", encoding="utf-8") as f:
                roadmap_content = f.read()
                label = msgs.get("roadmap_label", "ROADMAP.md Content:")
                sdlc_context += f"\n{label}\n{roadmap_content}\n"
        else:
            msg = msgs.get(
                "missing_roadmap_msg",
                "ROADMAP.md is missing. Please analyze the repository and create it."
            )
            sdlc_context += f"\n{msg}\n"

        # Load GitHub issues and PRs if integration is available
        if gh:
            try:
                issues = gh.get_open_issues()
                issue_list = "\n".join([f"- #{i.number}: {i.title}" for i in issues[:5]])
                if issue_list:
                    sdlc_context += f"\n{msgs['open_issues_label']}\n{issue_list}"

                prs = gh.get_pull_requests()
                pr_list = "\n".join([f"- #{p.number}: {p.title}" for p in prs[:5]])
                if pr_list:
                    sdlc_context += f"\n{msgs['open_prs_label']}\n{pr_list}"
            except Exception as error:
                logger.error(msgs.get("error_sdlc_context", "Error: {error}").format(error=error))

        return {"context": sdlc_context}
