/**
 * Docker Plugin - Docker Swarm management via dockerterminal
 *
 * Enables workflow nodes to manage Docker containers and Swarm clusters.
 * Integrates with the dockerterminal project.
 */

import { execSync } from 'child_process';
import * as path from 'path';

export const DOCKER_PATH = path.resolve(__dirname, '../../../../dockerterminal');
export const DEFAULT_API_URL = 'http://localhost:3002';

export interface DockerContainerInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  ports: string[];
}

export interface DockerServiceInfo {
  id: string;
  name: string;
  replicas: string;
  image: string;
  ports: string[];
}

/**
 * List Docker containers
 */
export async function dockerListContainers(input: {
  all?: boolean;
}): Promise<{ success: boolean; containers?: DockerContainerInfo[]; error?: string }> {
  const { all = false } = input;

  try {
    const cmd = `docker ps ${all ? '-a' : ''} --format '{"id":"{{.ID}}","name":"{{.Names}}","image":"{{.Image}}","status":"{{.Status}}","ports":"{{.Ports}}"}'`;
    const output = execSync(cmd).toString().trim();

    const containers = output
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const data = JSON.parse(line);
        return {
          ...data,
          ports: data.ports ? data.ports.split(',').map((p: string) => p.trim()) : [],
        };
      });

    return { success: true, containers };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * List Docker Swarm services
 */
export async function dockerListServices(): Promise<{
  success: boolean;
  services?: DockerServiceInfo[];
  error?: string;
}> {
  try {
    const cmd = `docker service ls --format '{"id":"{{.ID}}","name":"{{.Name}}","replicas":"{{.Replicas}}","image":"{{.Image}}","ports":"{{.Ports}}"}'`;
    const output = execSync(cmd).toString().trim();

    const services = output
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const data = JSON.parse(line);
        return {
          ...data,
          ports: data.ports ? data.ports.split(',').map((p: string) => p.trim()) : [],
        };
      });

    return { success: true, services };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Run a Docker container
 */
export async function dockerRun(input: {
  image: string;
  name?: string;
  ports?: string[];
  env?: Record<string, string>;
  detach?: boolean;
}): Promise<{ success: boolean; containerId?: string; error?: string }> {
  const { image, name, ports = [], env = {}, detach = true } = input;

  try {
    let cmd = 'docker run';

    if (detach) cmd += ' -d';
    if (name) cmd += ` --name ${name}`;

    for (const port of ports) {
      cmd += ` -p ${port}`;
    }

    for (const [key, value] of Object.entries(env)) {
      cmd += ` -e ${key}=${value}`;
    }

    cmd += ` ${image}`;

    const output = execSync(cmd).toString().trim();
    return { success: true, containerId: output };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Stop a Docker container
 */
export async function dockerStop(input: {
  container: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    execSync(`docker stop ${input.container}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Scale a Docker Swarm service
 */
export async function dockerScaleService(input: {
  service: string;
  replicas: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    execSync(`docker service scale ${input.service}=${input.replicas}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Deploy a stack to Docker Swarm
 */
export async function dockerDeployStack(input: {
  stackName: string;
  composeFile: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    execSync(`docker stack deploy -c ${input.composeFile} ${input.stackName}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Node definitions for workflow engine
export const dockerNodes = {
  'docker.listContainers': {
    description: 'List Docker containers',
    inputs: ['all'],
    outputs: ['success', 'containers', 'error'],
    execute: dockerListContainers,
  },
  'docker.listServices': {
    description: 'List Docker Swarm services',
    inputs: [],
    outputs: ['success', 'services', 'error'],
    execute: dockerListServices,
  },
  'docker.run': {
    description: 'Run a Docker container',
    inputs: ['image', 'name', 'ports', 'env', 'detach'],
    outputs: ['success', 'containerId', 'error'],
    execute: dockerRun,
  },
  'docker.stop': {
    description: 'Stop a Docker container',
    inputs: ['container'],
    outputs: ['success', 'error'],
    execute: dockerStop,
  },
  'docker.scaleService': {
    description: 'Scale a Docker Swarm service',
    inputs: ['service', 'replicas'],
    outputs: ['success', 'error'],
    execute: dockerScaleService,
  },
  'docker.deployStack': {
    description: 'Deploy a stack to Docker Swarm',
    inputs: ['stackName', 'composeFile'],
    outputs: ['success', 'error'],
    execute: dockerDeployStack,
  },
};
