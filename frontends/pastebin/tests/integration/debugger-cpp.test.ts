/**
 * @jest-environment node
 *
 * Integration tests: cpp-debug Docker image + codelldb DAP adapter.
 * Spins up the real container, compiles a C++ file, connects TCP,
 * and validates the DAP handshake.
 *
 * Requires Docker daemon and cpp-debug:latest image.
 * Skipped automatically when SKIP_CONTAINER_TESTS=1.
 */

import * as net from 'net'
import { GenericContainer, Wait } from 'testcontainers'

const SKIP = process.env.SKIP_CONTAINER_TESTS === '1'
const DAP_PORT = 5678

// -----------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------

const CPP_HELLO = `
#include <iostream>
int main() {
  int x = 42;
  std::cout << x << std::endl;
  return 0;
}
`.trim()

function dapFrame(msg: object): Buffer {
  const body = Buffer.from(JSON.stringify(msg))
  const header = Buffer.from(`Content-Length: ${body.length}\r\n\r\n`)
  return Buffer.concat([header, body])
}

function collectDapMessages(
  sock: net.Socket,
  count: number,
  timeoutMs: number,
): Promise<object[]> {
  return new Promise((resolve, reject) => {
    const msgs: object[] = []
    let buf = ''
    const timer = setTimeout(() => {
      sock.off('data', onData)
      resolve(msgs)
    }, timeoutMs)
    const onData = (chunk: Buffer) => {
      buf += chunk.toString()
      while (true) {
        const sep = buf.indexOf('\r\n\r\n')
        if (sep === -1) break
        const hdr = buf.slice(0, sep)
        const m = hdr.match(/Content-Length:\s*(\d+)/i)
        if (!m) break
        const len = parseInt(m[1], 10)
        const body = buf.slice(sep + 4)
        if (body.length < len) break
        msgs.push(JSON.parse(body.slice(0, len)))
        buf = body.slice(len)
        if (msgs.length >= count) {
          clearTimeout(timer)
          sock.off('data', onData)
          resolve(msgs)
          return
        }
      }
    }
    sock.on('data', onData)
    sock.on('error', err => {
      clearTimeout(timer)
      reject(err)
    })
  })
}

// -----------------------------------------------------------------
// DAP container tests
// (codelldb sends 'initialized' event AFTER launch, not after initialize)
// -----------------------------------------------------------------

describe('cpp-debug container', () => {
  let container: Awaited<ReturnType<GenericContainer['start']>>
  let dapMessages: object[] = []

  beforeAll(async () => {
    if (SKIP) return
    const src = CPP_HELLO.replace(/'/g, "'\\''")
    const cmd = [
      'sh',
      '-c',
      `mkdir -p /workspace && printf '%s' '${src}' > /workspace/main.cpp` +
        ` && g++ -g -O0 -o /workspace/__prog__ /workspace/main.cpp` +
        ` && ( /opt/codelldb/extension/adapter/codelldb` +
        ` --port 15678 --multi-session &` +
        ` sleep 1` +
        ` && socat TCP-LISTEN:${DAP_PORT},bind=0.0.0.0,reuseaddr,fork` +
        ` TCP:127.0.0.1:15678 )`,
    ]
    container = await new GenericContainer('cpp-debug:latest')
      .withCommand(cmd)
      .withExposedPorts(DAP_PORT)
      .withWaitStrategy(Wait.forListeningPorts())
      .start()

    const port = container.getMappedPort(DAP_PORT)
    const sock = net.createConnection(port, '127.0.0.1')
    await new Promise<void>((res, rej) => {
      sock.once('connect', res)
      sock.once('error', rej)
    })

    // initialize
    sock.write(
      dapFrame({
        seq: 1,
        type: 'request',
        command: 'initialize',
        arguments: {
          clientID: 'test',
          adapterID: 'lldb',
          linesStartAt1: true,
          columnsStartAt1: true,
          pathFormat: 'path',
        },
      }),
    )
    const [initResp] = await collectDapMessages(sock, 1, 10_000)

    // launch — codelldb sends 'initialized' event AFTER this
    sock.write(
      dapFrame({
        seq: 2,
        type: 'request',
        command: 'launch',
        arguments: {
          request: 'launch',
          program: '/workspace/__prog__',
          args: [],
          cwd: '/workspace',
          stopAtEntry: false,
        },
      }),
    )

    // Collect up to 6 messages (output + initialized + launch-resp + …)
    const post = await collectDapMessages(sock, 6, 15_000)
    dapMessages = [initResp, ...post].filter(Boolean)
    sock.destroy()
  }, 120_000)

  afterAll(async () => {
    if (SKIP || !container) return
    await container.stop()
  })

  it('responds to DAP initialize with capabilities', () => {
    if (SKIP) return
    expect(dapMessages.length).toBeGreaterThanOrEqual(1)
    expect(dapMessages[0]).toMatchObject({
      type: 'response',
      command: 'initialize',
      success: true,
    })
  })

  it('sends initialized event after launch', () => {
    if (SKIP) return
    const eventNames = dapMessages
      .filter((m: unknown) => (m as Record<string, unknown>).type === 'event')
      .map((m: unknown) => (m as Record<string, unknown>).event)
    expect(eventNames).toContain('initialized')
  })
})

// -----------------------------------------------------------------
// Compilation smoke tests (no shared container needed)
// -----------------------------------------------------------------

describe('g++ compilation in cpp-debug image', () => {
  it('compiles and runs hello world', async () => {
    if (SKIP) return
    const { execSync } = await import('child_process')
    const out = execSync(
      'docker run --rm cpp-debug:latest sh -c ' +
        "\"printf '#include<iostream>\\nint main(){std::cout<<42<<std::endl;}'" +
        ' > /tmp/t.cpp && g++ -o /tmp/t /tmp/t.cpp && /tmp/t"',
    )
      .toString()
      .trim()
    expect(out).toBe('42')
  }, 30_000)

  it('codelldb binary is executable', async () => {
    if (SKIP) return
    const { execSync } = await import('child_process')
    const out = execSync(
      'docker run --rm cpp-debug:latest ' +
        '/opt/codelldb/extension/adapter/codelldb --help 2>&1 || true',
    ).toString()
    expect(out).toMatch(/--port/)
  }, 15_000)
})
