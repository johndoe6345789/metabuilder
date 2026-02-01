/**
 * Game Engine Plugin - SDL3 C++ game engine integration
 *
 * Enables workflow nodes to interact with the gameengine project.
 * Provides build, run, and asset management capabilities.
 */

import { spawn, execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const GAMEENGINE_PATH = path.resolve(__dirname, '../../../../gameengine');

export interface GameEngineBuildInput {
  profile?: 'debug' | 'release';
  clean?: boolean;
}

export interface GameEngineBuildOutput {
  success: boolean;
  buildPath?: string;
  error?: string;
}

export interface GameEngineRunInput {
  executable?: string;
  args?: string[];
}

export interface GameEngineRunOutput {
  success: boolean;
  pid?: number;
  error?: string;
}

/**
 * Build the game engine
 */
export async function gameengineBuild(input: GameEngineBuildInput): Promise<GameEngineBuildOutput> {
  const { profile = 'release', clean = false } = input;
  const buildDir = path.join(GAMEENGINE_PATH, 'build', profile);

  return new Promise((resolve) => {
    try {
      // Clean if requested
      if (clean && fs.existsSync(buildDir)) {
        fs.rmSync(buildDir, { recursive: true });
      }

      // Create build directory
      fs.mkdirSync(buildDir, { recursive: true });

      // Configure with CMake
      const cmakeArgs = [
        '-S', GAMEENGINE_PATH,
        '-B', buildDir,
        `-DCMAKE_BUILD_TYPE=${profile === 'release' ? 'Release' : 'Debug'}`,
      ];

      execSync(`cmake ${cmakeArgs.join(' ')}`, { cwd: GAMEENGINE_PATH });

      // Build
      execSync(`cmake --build ${buildDir} --parallel`, { cwd: GAMEENGINE_PATH });

      resolve({
        success: true,
        buildPath: buildDir,
      });
    } catch (error) {
      resolve({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

/**
 * Run a game engine executable
 */
export async function gameengineRun(input: GameEngineRunInput): Promise<GameEngineRunOutput> {
  const { executable = 'game', args = [] } = input;
  const execPath = path.join(GAMEENGINE_PATH, 'build', 'release', executable);

  return new Promise((resolve) => {
    if (!fs.existsSync(execPath)) {
      resolve({
        success: false,
        error: `Executable not found: ${execPath}`,
      });
      return;
    }

    const proc = spawn(execPath, args, {
      cwd: GAMEENGINE_PATH,
      detached: true,
      stdio: 'ignore',
    });

    proc.unref();

    resolve({
      success: true,
      pid: proc.pid,
    });
  });
}

/**
 * List available game engine packages/modules
 */
export async function gameengineListPackages(): Promise<{ packages: string[] }> {
  const packagesDir = path.join(GAMEENGINE_PATH, 'packages');

  if (!fs.existsSync(packagesDir)) {
    return { packages: [] };
  }

  const packages = fs.readdirSync(packagesDir)
    .filter(f => fs.statSync(path.join(packagesDir, f)).isDirectory());

  return { packages };
}

// Node definitions for workflow engine
export const gameengineNodes = {
  'gameengine.build': {
    description: 'Build the SDL3 game engine',
    inputs: ['profile', 'clean'],
    outputs: ['success', 'buildPath', 'error'],
    execute: gameengineBuild,
  },
  'gameengine.run': {
    description: 'Run a game engine executable',
    inputs: ['executable', 'args'],
    outputs: ['success', 'pid', 'error'],
    execute: gameengineRun,
  },
  'gameengine.listPackages': {
    description: 'List available game engine packages',
    inputs: [],
    outputs: ['packages'],
    execute: gameengineListPackages,
  },
};
