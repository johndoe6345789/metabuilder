/**
 * PCB Generator Plugin - PCB design automation via pcbgenerator
 *
 * Enables workflow nodes to create PCB designs programmatically.
 * Wraps the Python pcbgenerator/boardforge library.
 */

import { spawn } from 'child_process';
import * as path from 'path';

const PCB_PATH = path.resolve(__dirname, '../../../../pcbgenerator');

export interface PCBGenerateInput {
  script: string;
  outputPath?: string;
  outputFormat?: 'kicad' | 'gerber' | 'svg' | 'png';
}

export interface PCBGenerateOutput {
  success: boolean;
  outputPath?: string;
  error?: string;
}

export interface PCBComponentInput {
  name: string;
  package: string;
  x: number;
  y: number;
  rotation?: number;
}

export interface PCBTraceInput {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  width?: number;
  layer?: 'top' | 'bottom';
}

/**
 * Execute a PCB generation script
 */
export async function pcbGenerate(input: PCBGenerateInput): Promise<PCBGenerateOutput> {
  const { script, outputPath, outputFormat = 'kicad' } = input;

  return new Promise((resolve) => {
    const pythonProcess = spawn('python3', ['-c', script], {
      cwd: PCB_PATH,
      env: { ...process.env, PYTHONPATH: PCB_PATH },
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
 * Create a simple PCB with components
 */
export async function pcbCreateBoard(params: {
  width: number;
  height: number;
  components: PCBComponentInput[];
  traces: PCBTraceInput[];
  outputPath: string;
}): Promise<PCBGenerateOutput> {
  const componentsJson = JSON.stringify(params.components);
  const tracesJson = JSON.stringify(params.traces);

  const script = `
from boardforge import Board, Component, Trace
import json

board = Board(width=${params.width}, height=${params.height})

components = json.loads('${componentsJson}')
for comp in components:
    board.add_component(
        Component(comp['name'], comp['package'], comp['x'], comp['y'], comp.get('rotation', 0))
    )

traces = json.loads('${tracesJson}')
for trace in traces:
    board.add_trace(
        Trace(trace['startX'], trace['startY'], trace['endX'], trace['endY'],
              width=trace.get('width', 0.25), layer=trace.get('layer', 'top'))
    )

board.export("${params.outputPath}")
print("${params.outputPath}")
`;

  return pcbGenerate({ script, outputPath: params.outputPath });
}

/**
 * List available PCB footprints
 */
export async function pcbListFootprints(): Promise<{ footprints: string[] }> {
  return new Promise((resolve) => {
    const script = `
from boardforge.footprints import list_footprints
for fp in list_footprints():
    print(fp)
`;

    const pythonProcess = spawn('python3', ['-c', script], {
      cwd: PCB_PATH,
      env: { ...process.env, PYTHONPATH: PCB_PATH },
    });

    let stdout = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.on('close', () => {
      const footprints = stdout.trim().split('\n').filter(Boolean);
      resolve({ footprints });
    });
  });
}

// Node definitions for workflow engine
export const pcbNodes = {
  'pcb.generate': {
    description: 'Execute a PCB generation script',
    inputs: ['script', 'outputPath', 'outputFormat'],
    outputs: ['success', 'outputPath', 'error'],
    execute: pcbGenerate,
  },
  'pcb.createBoard': {
    description: 'Create a PCB with components and traces',
    inputs: ['width', 'height', 'components', 'traces', 'outputPath'],
    outputs: ['success', 'outputPath', 'error'],
    execute: pcbCreateBoard,
  },
  'pcb.listFootprints': {
    description: 'List available PCB footprints',
    inputs: [],
    outputs: ['footprints'],
    execute: pcbListFootprints,
  },
};
