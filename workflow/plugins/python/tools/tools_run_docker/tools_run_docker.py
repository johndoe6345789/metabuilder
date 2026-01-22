"""Workflow plugin: run command in Docker container."""

import subprocess
import os
import logging

from ...base import NodeExecutor

logger = logging.getLogger("metabuilder.docker")


class ToolsRunDocker(NodeExecutor):
    """Run a command inside a Docker container."""

    node_type = "tools.run_docker"
    category = "tools"
    description = "Run a command inside a Docker container with optional volumes and working directory"

    def execute(self, inputs, runtime=None):
        """Run a command inside a Docker container.

        Inputs:
        - image: Docker image to use
        - command: Command to execute
        - volumes: Optional dict of volume mappings {host_path: container_path}
        - workdir: Optional working directory inside the container
        """
        image = inputs.get("image")
        command = inputs.get("command")
        volumes = inputs.get("volumes")
        workdir = inputs.get("workdir")

        if not image or not command:
            return {"error": "Both 'image' and 'command' are required"}

        output = self._run_command_in_docker(image, command, volumes, workdir)
        return {"output": output}

    def _run_command_in_docker(self, image: str, command: str, volumes: dict = None, workdir: str = None):
        """Run a command inside a Docker container.

        :param image: Docker image to use.
        :param command: Command to execute.
        :param volumes: Dictionary of volume mappings {host_path: container_path}.
        :param workdir: Working directory inside the container.
        :return: Standard output of the command.
        """
        docker_command = ["docker", "run", "--rm"]

        if volumes:
            for host_path, container_path in volumes.items():
                docker_command.extend(["-v", f"{os.path.abspath(host_path)}:{container_path}"])

        if workdir:
            docker_command.extend(["-w", workdir])

        docker_command.append(image)
        docker_command.extend(["sh", "-c", command])

        logger.info(f"Executing in Docker ({image}): {command}")
        result = subprocess.run(docker_command, capture_output=True, text=True, check=False)

        output = result.stdout
        if result.stderr:
            output += "\n" + result.stderr

        logger.info(output)
        return output
