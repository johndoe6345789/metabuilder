/**
 * CadQuery Plugin - 3D CAD modeling via cadquerywrapper
 *
 * Enables workflow nodes to create parametric 3D models using CadQuery.
 * Wraps the Python cadquerywrapper library.
 */

import { spawn } from 'child_process';
import * as path from 'path';

const CADQUERY_PATH = path.resolve(__dirname, '../../../../cadquerywrapper');

export interface CadQueryInput {
  script: string;
  outputFormat?: 'step' | 'stl' | 'obj' | 'svg';
  outputPath?: string;
}

export interface CadQueryOutput {
  success: boolean;
  outputPath?: string;
  error?: string;
}

/**
 * Execute a CadQuery script to generate 3D models
 */
export async function cadqueryExecute(input: CadQueryInput): Promise<CadQueryOutput> {
  const { script, outputFormat = 'step', outputPath } = input;

  return new Promise((resolve) => {
    const pythonProcess = spawn('python3', ['-c', script], {
      cwd: CADQUERY_PATH,
      env: { ...process.env, PYTHONPATH: CADQUERY_PATH },
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve({
          success: true,
          outputPath: outputPath || stdout.trim(),
        });
      } else {
        resolve({
          success: false,
          error: stderr || `Process exited with code ${code}`,
        });
      }
    });
  });
}

/**
 * Create a simple box using CadQuery
 */
export async function cadqueryBox(params: {
  length: number;
  width: number;
  height: number;
  outputPath: string;
}): Promise<CadQueryOutput> {
  const script = `
import cadquery as cq
result = cq.Workplane("XY").box(${params.length}, ${params.width}, ${params.height})
cq.exporters.export(result, "${params.outputPath}")
print("${params.outputPath}")
`;
  return cadqueryExecute({ script, outputPath: params.outputPath });
}

/**
 * Create a cylinder using CadQuery
 */
export async function cadqueryCylinder(params: {
  radius: number;
  height: number;
  outputPath: string;
}): Promise<CadQueryOutput> {
  const script = `
import cadquery as cq
result = cq.Workplane("XY").cylinder(${params.height}, ${params.radius})
cq.exporters.export(result, "${params.outputPath}")
print("${params.outputPath}")
`;
  return cadqueryExecute({ script, outputPath: params.outputPath });
}

// Node definitions for workflow engine
export const cadqueryNodes = {
  'cadquery.execute': {
    description: 'Execute a CadQuery Python script',
    inputs: ['script', 'outputFormat', 'outputPath'],
    outputs: ['success', 'outputPath', 'error'],
    execute: cadqueryExecute,
  },
  'cadquery.box': {
    description: 'Create a 3D box',
    inputs: ['length', 'width', 'height', 'outputPath'],
    outputs: ['success', 'outputPath', 'error'],
    execute: cadqueryBox,
  },
  'cadquery.cylinder': {
    description: 'Create a 3D cylinder',
    inputs: ['radius', 'height', 'outputPath'],
    outputs: ['success', 'outputPath', 'error'],
    execute: cadqueryCylinder,
  },
};
