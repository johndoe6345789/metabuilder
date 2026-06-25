export type DapRequestMsg = {
  seq: number
  type: 'request'
  command: string
  arguments: Record<string, unknown>
}

/** Build a DAP request frame. */
export function dapRequest(
  seq: number,
  command: string,
  args: Record<string, unknown> = {},
): DapRequestMsg {
  return { seq, type: 'request', command, arguments: args }
}

export function initializeArgs(adapterID: string) {
  return {
    clientID: 'codesnippet',
    clientName: 'CodeSnippet Debugger',
    adapterID,
    pathFormat: 'path',
    linesStartAt1: true,
    columnsStartAt1: true,
    supportsVariableType: true,
    supportsVariablePaging: false,
    supportsRunInTerminalRequest: false,
  }
}

export function setBreakpointsArgs(filename: string, lines: number[]) {
  return {
    source: { name: filename, path: `/workspace/${filename}` },
    breakpoints: lines.map(l => ({ line: l })),
    sourceModified: false,
  }
}
