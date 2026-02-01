/**
 * Mojo Plugin - Systems programming integration
 *
 * Enables workflow nodes to compile and run Mojo code.
 * Leverages Mojo's Python superset for high-performance computing.
 */

import { execSync, spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const MOJO_PATH = path.resolve(__dirname, '../../../../mojo');

export interface MojoRunInput {
  code: string;
  args?: string[];
}

export interface MojoRunOutput {
  success: boolean;
  output?: string;
  error?: string;
  executionTime?: number;
}

export interface MojoBuildInput {
  sourcePath: string;
  outputPath?: string;
  optimize?: boolean;
}

export interface MojoBuildOutput {
  success: boolean;
  binaryPath?: string;
  error?: string;
}

/**
 * Run Mojo code directly
 */
export async function mojoRun(input: MojoRunInput): Promise<MojoRunOutput> {
  const { code, args = [] } = input;

  // Write code to temp file
  const tempFile = path.join(os.tmpdir(), `mojo_${Date.now()}.mojo`);

  return new Promise((resolve) => {
    try {
      fs.writeFileSync(tempFile, code);

      const startTime = Date.now();
      const output = execSync(`mojo run ${tempFile} ${args.join(' ')}`, {
        cwd: MOJO_PATH,
        encoding: 'utf-8',
        timeout: 60000,
      });
      const executionTime = Date.now() - startTime;

      fs.unlinkSync(tempFile);

      resolve({
        success: true,
        output: output.trim(),
        executionTime,
      });
    } catch (error) {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);

      resolve({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

/**
 * Build a Mojo file to native binary
 */
export async function mojoBuild(input: MojoBuildInput): Promise<MojoBuildOutput> {
  const { sourcePath, outputPath, optimize = true } = input;

  const fullSourcePath = path.isAbsolute(sourcePath)
    ? sourcePath
    : path.join(MOJO_PATH, sourcePath);

  const binaryPath = outputPath ||
    fullSourcePath.replace(/\.mojo$/, '');

  try {
    let cmd = `mojo build ${fullSourcePath} -o ${binaryPath}`;
    if (optimize) cmd += ' -O3';

    execSync(cmd, { cwd: MOJO_PATH });

    return {
      success: true,
      binaryPath,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Run a Mojo example from the examples directory
 */
export async function mojoRunExample(input: {
  example: string;
  args?: string[];
}): Promise<MojoRunOutput> {
  const { example, args = [] } = input;

  // Find the example file
  const examplesDir = path.join(MOJO_PATH, 'examples');
  let examplePath = '';

  // Try direct path first
  const directPath = path.join(examplesDir, example);
  if (fs.existsSync(directPath)) {
    examplePath = directPath;
  } else if (fs.existsSync(`${directPath}.mojo`)) {
    examplePath = `${directPath}.mojo`;
  } else {
    // Search in subdirectories
    const subdirs = fs.readdirSync(examplesDir)
      .filter(f => fs.statSync(path.join(examplesDir, f)).isDirectory());

    for (const subdir of subdirs) {
      const subPath = path.join(examplesDir, subdir, example);
      if (fs.existsSync(subPath)) {
        examplePath = subPath;
        break;
      } else if (fs.existsSync(`${subPath}.mojo`)) {
        examplePath = `${subPath}.mojo`;
        break;
      }
    }
  }

  if (!examplePath) {
    return {
      success: false,
      error: `Example not found: ${example}`,
    };
  }

  try {
    const startTime = Date.now();
    const output = execSync(`mojo run ${examplePath} ${args.join(' ')}`, {
      cwd: MOJO_PATH,
      encoding: 'utf-8',
      timeout: 60000,
    });
    const executionTime = Date.now() - startTime;

    return {
      success: true,
      output: output.trim(),
      executionTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * List available Mojo examples
 */
export async function mojoListExamples(): Promise<{ examples: string[] }> {
  const examplesDir = path.join(MOJO_PATH, 'examples');

  if (!fs.existsSync(examplesDir)) {
    return { examples: [] };
  }

  const examples: string[] = [];

  function scanDir(dir: string, prefix = '') {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDir(fullPath, `${prefix}${item}/`);
      } else if (item.endsWith('.mojo')) {
        examples.push(`${prefix}${item}`);
      }
    }
  }

  scanDir(examplesDir);
  return { examples };
}

// Node definitions for workflow engine
export const mojoNodes = {
  'mojo.run': {
    description: 'Run Mojo code directly',
    inputs: ['code', 'args'],
    outputs: ['success', 'output', 'error', 'executionTime'],
    execute: mojoRun,
  },
  'mojo.build': {
    description: 'Build Mojo file to native binary',
    inputs: ['sourcePath', 'outputPath', 'optimize'],
    outputs: ['success', 'binaryPath', 'error'],
    execute: mojoBuild,
  },
  'mojo.runExample': {
    description: 'Run a Mojo example',
    inputs: ['example', 'args'],
    outputs: ['success', 'output', 'error', 'executionTime'],
    execute: mojoRunExample,
  },
  'mojo.listExamples': {
    description: 'List available Mojo examples',
    inputs: [],
    outputs: ['examples'],
    execute: mojoListExamples,
  },
};
